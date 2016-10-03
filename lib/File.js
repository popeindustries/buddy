'use strict';

const { debug, print, strong, warn } = require('./utils/cnsl');
const { getSharedDecendants, walk } = require('./utils/tree');
const { regexpEscape, truncate } = require('./utils/string');
const { resolve, nativeModules } = require('./dependency-resolver');
const { readFileSync: readFile, writeFileSync: writeFile } = require('fs');
const { mkdir: { sync: mkdir } } = require('recur-fs');
const callable = require('./utils/callable');
const chalk = require('chalk');
const md5 = require('md5');
const parallel = require('async/parallel');
const path = require('path');
const series = require('async/series');
const sortBy = require('lodash/sortBy');
const unique = require('lodash/uniq');

const MAX_DEPTH = 10000;
const MAX_DEPTH_CIRCULAR = MAX_DEPTH / 2;
const RE_ESCAPE_ID = /[#._-\s/\\]/g;
const WORKFLOW_INLINEABLE = ['load'];
const WORKFLOW_STANDARD = [
  'load',
  'parse',
  'runWorkflowForDependencies'
];
const WORKFLOWS = {
  standard: 1,
  inlineable: 2,
  writeable: 4
};
let total = 0;

module.exports = class File {
  /**
   * Constructor
   * @param {String} id
   * @param {String} filepath
   * @param {String} type
   * @param {Object} options
   *  - {Object} caches
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Object} globalAliases
   *  - {Array} npmModulepaths
   *  - {Object} pluginOptions
   *  - {Object} runtimeOptions
   */
  constructor (id, filepath, type, options) {
    total++;
    this.allDependencies = null;
    this.content = '';
    this.encoding = 'utf8';
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.depth = 0;
    this.fileContent = '';
    this.filepath = filepath;
    this.hash = '';
    this.helpers = [];
    this.id = id;
    // TODO: short name when compressed?
    this.idSafe = id.replace(RE_ESCAPE_ID, '');
    this.isCircularDependency = false;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.options = options;
    this.parent = null;
    this.ran = 0;
    this.type = type;
    this.workflows = {
      standard: [WORKFLOW_STANDARD],
      inlineable: [WORKFLOW_INLINEABLE],
      writeable: [[]]
    };

    this.extension = path.extname(this.filepath).slice(1);
    this.relpath = truncate(path.relative(process.cwd(), filepath));
    this.name = path.basename(this.filepath);

    // Force generation of hash
    this.load();

    debug(`created File instance ${strong(this.relpath)}`, 3);
  }

  /**
   * Retrieve writeable state
   * @param {Boolean} batch
   * @returns {Boolean}
   */
  isWriteable (batch) {
    return !this.isInline
      // Only writeable if not node_module in batch mode
      && batch ? !~this.filepath.indexOf('node_modules') : !this.isDependency;
  }

  /**
   * Retrieve inlineable state
   * @returns {Boolean}
   */
  isInlineable () {
    return this.isInline;
  }

  /**
   * Retrieve parsed workflows for 'buildOptions'
   * @param {String} type
   * @param {Number} index
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @returns {Array}
   */
  parseWorkflow (type, index, buildOptions) {
    if (!this.workflows[type] || !this.workflows[type][index]) return [];

    return this.workflows[type][index].reduce((tasks, task) => {
      if (~task.indexOf(':')) {
        let conditions = task.split(':');

        task = conditions.pop();
        const passed = conditions.every((condition) => {
          return (condition.charAt(0) == '!')
            ? !buildOptions[condition.slice(1)]
            : buildOptions[condition];
        });

        if (!passed) return tasks;
      }
      tasks.push(task);
      return tasks;
    }, []);
  }

  /**
   * Retrieve flattened dependency tree
   * @returns {Array}
   */
  getAllDependencies () {
    if (this.allDependencies) return this.allDependencies;

    let sorted = [];
    let unsorted = [];

    walk(this.dependencies, (file) => {
      if (!unsorted.includes(file)) {
        unsorted.push(file);
        if (file.dependencies.length) return file.dependencies;
      }
    });

    sortBy(unsorted, 'depth')
      .reverse()
      .forEach((file) => {
        if (!sorted.includes(file) && file !== this) {
          walk(file.dependencyReferences, (reference) => {
            if (!reference.file) return;
            // Keep walking all non-circular references
            return reference.file.dependencyReferences.filter((reference) => !sorted.includes(reference.file) && reference.file != file && file !== this);
          }, (reference) => {
            // Add reference file after walking it's dependencies
            if (!sorted.includes(reference.file)) {
              console.log('  ', reference.file.id, reference.file.depth, reference.file.isCircularDependency);
              sorted.push(reference.file);
            }
          });
          if (!sorted.includes(file)) {
            console.log(file.id, file.depth, file.isCircularDependency);
            sorted.push(file);
          }
        }
      });

    console.log(unsorted.length, sorted.length, total)
    this.allDependencies = sorted;
    return this.allDependencies;
  }

  /**
   * Retrieve flattened helpers
   * @returns {Array}
   */
  getAllHelpers () {
    let helpers = [];

    function add (parent) {
      helpers.push(...parent.helpers);
      // Add children
      parent.dependencies.forEach((dependency) => {
        if (parent.id == dependency.owner) {
          add(dependency);
        }
      });
    }

    add(this);

    return unique(helpers);
  }

  /**
   * Add 'dependencies'
   * @param {Array} dependencies
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   */
  addDependencies (dependencies, buildOptions) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const { browser = true, ignoredFiles = [], watchOnly = false } = buildOptions;
    const resolveOptions = {
      fileExtensions: this.options.fileExtensions,
      globalAliases: this.options.globalAliases
    };
    let isCircularDependency = false;

    // Files with no dependencies can safely be promoted to max depth
    if (!dependencies.length) this.depth = MAX_DEPTH;
    if (~this.id.indexOf('babel')) console.log(this.id)
    dependencies.forEach((dependency) => {
      // Inlined/sidecar dependencies are pre-resolved
      const filepath = dependency.filepath || resolve(this.filepath, dependency.id, resolveOptions);

      // Unable to resolve filepath or create instance
      if (filepath === '') {
        warn(`dependency ${strong(dependency.id)} for ${strong(this.id)} not found`, 3);
        return;
      }

      this.dependencyReferences.push(dependency);

      // Handle disabled, including native modules (force ignore of node_modules when watch only build)
      if (filepath === false || (watchOnly && ~filepath.indexOf('node_modules'))) {
        // Don't disable native modules on server
        dependency.isDisabled = browser ? true : !nativeModules.includes(dependency.id);
        return;
      }

      const file = this.options.fileFactory(filepath, this.options);
      if (~file.id.indexOf('babel')) console.log('  ', file.id)

      // Identify as inline-source dependency
      file.isInline = 'stack' in dependency;
      dependency.file = file;

      // Ignore if parent file or ignored child file
      if (file.isLocked || ignoredFiles.includes(filepath)) {
        dependency.isIgnored = true;
        return;
      }

      // Handle shared dependency
      if (file.isDependency) {
        // Ignore if already flagged as circular dependency
        if (file.isCircularDependency) {
          // console.log('=======lookout', this.id, file.id)
          // file.depth++;
          // return;
        }

        // Check for circular dependency (including deeply nested)
        // If 'file' is an ancestor of 'this',
        // we have a circular dependency one or several times removed
        let decendants = getSharedDecendants(this, file);

        // Files are related (dependency is an ancestor)
        if (decendants.length) {
          isCircularDependency = true;
          // Replace ancestor dependency with current
          // decendants.push(this);
          // Flag all files from current to ancestor as circular
          decendants.forEach((file, idx) => {
            file.isCircularDependency = true;
            file.depth = Math.max(MAX_DEPTH_CIRCULAR, file.depth) + 1;
            console.log('  isCircularDependency', file.id, file.depth)
          });

          return;
        }

        // Promote to higher depth
        if (file.depth < this.depth + 1) file.depth = this.depth + 1;

        return;
      }

      // Handle own dependency
      file.isDependency = true;
      file.depth = this.depth + 1;
      file.parent = this;
      this.dependencies.push(file);
    });

    if (isCircularDependency) {
      console.log('  isCircularDependency', this.id)
      this.isCircularDependency = true;
      this.depth = MAX_DEPTH_CIRCULAR;
    }
  }

  /**
   * Inline dependencyReferences
   */
  inlineDependencyReferences () {
    function inline (content, references) {
      let inlineContent;

      references.forEach((reference) => {
        // Inline nested dependencies
        // Duplicates are allowed (not @import_once)
        inlineContent = reference.file.dependencyReferences.length
          ? inline(reference.file.content, reference.file.dependencyReferences)
          : reference.file.content;
        // Replace @import * with inlined content
        if (reference.context) content = content.replace(new RegExp(regexpEscape(reference.context), 'mg'), inlineContent);
      });
      return content;
    }

    // TODO: remove comments?
    this.content = inline(this.content, this.dependencyReferences);
  }

  /**
   * Run workflow set based on 'type' and 'buildOptions'
   * @param {String} type
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   * @returns {null}
   */
  run (type, buildOptions, fn) {
    if (!this.workflows[type]) return fn();

    const workflows = this.workflows[type].map((workflow, idx) => {
      return callable(this, 'runWorkflow', type, idx, buildOptions);
    });

    series(workflows, (err) => {
      if (err) return fn(err);
      fn();
    });
  }

  /**
   * Run workflow set for 'type' and 'buildOptions' on 'dependencies'
   * @param {String} type
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Array} [dependencies]
   * @param {Function} fn(err)
   */
  runForDependencies (type, buildOptions, dependencies, fn) {
    dependencies = dependencies || [...this.dependencies];
    parallel(dependencies.map((dependency) => {
      return callable(dependency, 'run', type, buildOptions);
    }), fn);
  }

  /**
   * Run workflow tasks for 'type' and 'index'
   * @param {String} type
   * @param {Number} index
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   * @returns {null}
   */
  runWorkflow (type, index, buildOptions, fn) {
    if (this.ran & WORKFLOWS[type] * (index + 1)) return fn();

    const workflow = this.parseWorkflow(type, index, buildOptions);
    const tasks = workflow.map((task) => {
      return (task == 'runWorkflowForDependencies')
        ? callable(this, task, type, index, buildOptions)
        : callable(this, task, buildOptions);
    });

    series(tasks, (err) => {
      console.log('++++++++', this.id, '++++++++')
      if (err) return fn(err);
      this.ran |= WORKFLOWS[type] * (index + 1);
      fn();
    });
  }

  /**
   * Run workflow tasks for 'type' and 'index' on dependencies
   * @param {String} type
   * @param {Number} index
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  runWorkflowForDependencies (type, index, buildOptions, fn) {
    series(this.dependencies.map((dependency) => {
      return callable(dependency, 'runWorkflow', type, index, buildOptions);
    }), fn);
  }

  /**
   * Read and store file contents
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  load (buildOptions, fn) {
    if (!this.fileContent) {
      const content = readFile(this.filepath, this.encoding);

      this.content = this.fileContent = content;
      this.hash = md5(content);

      debug(`load: ${strong(this.relpath)}`, 4);
    } else {
      this.content = this.fileContent;
    }

    if (fn) fn();
  }

  /**
   * Parse file contents for dependency references [no-op]
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  parse (buildOptions, fn) {
    debug(`parse: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Compile file contents [no-op]
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  compile (buildOptions, fn) {
    debug(`compile: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Compress file contents [no-op]
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  compress (buildOptions, fn) {
    debug(`compress: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Write file contents to disk
   * @param {String} filepath
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err, results)
   */
  write (filepath, buildOptions, fn) {
    this.run('writeable', buildOptions, (err) => {
      if (err) return fn(err);

      const relpath = truncate(path.relative(process.cwd(), filepath));

      mkdir(filepath);
      writeFile(filepath, this.content, 'utf8');

      print(chalk.green(`built${this.options.runtimeOptions.compress ? ' and compressed' : ''} ${strong(relpath)}`), 2);

      fn(null, {
        filepath,
        hash: md5(this.content),
        helpers: this.getAllHelpers(),
        date: Date.now()
      });
    });
  }

  /**
   * Reset content
   * @param {Boolean} hard
   */
  reset (hard) {
    this.allDependencies = null;
    this.isCircularDependency = false;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.depth = 0;
    this.helpers = [];
    this.parent = null;
    this.ran = 0;
    if (!hard) {
      this.content = this.fileContent;
    } else {
      this.content = this.fileContent = '';
    }
    debug(`reset${hard ? '(hard):' : ':'} ${strong(this.relpath)}`, 4);
  }

  /**
   * Destroy instance
   */
  destroy () {
    this.reset(true);
    this.options = null;
  }
};