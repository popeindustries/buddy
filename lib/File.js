'use strict';

const { series, parallel } = require('async');
const { debug, print, strong, warn } = require('./utils/cnsl');
const { regexpEscape, truncate } = require('./utils/string');
const { resolve } = require('./identify-resource');
const { readFileSync: readFile, writeFileSync: writeFile } = require('fs');
const callable = require('./utils/callable');
const chalk = require('chalk');
const md5 = require('md5');
const path = require('path');
const mkdir = require('recur-fs').mkdir.sync;

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
   *  - {Object} pluginOptions
   *  - {Object} runtimeOptions
   *  - {Array} sources
   */
  constructor (id, filepath, type, options) {
    this.content = '';
    this.encoding = 'utf8';
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.fileContent = '';
    this.filepath = filepath;
    this.hash = '';
    this.id = id;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.options = options;
    this.type = type;
    this.workflows = {
      default: ['load', 'parse'],
      core: [],
      inline: ['load'],
      write: []
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
   * @param {Boolean} isBatch
   * @returns {Boolean}
   */
  isWriteable (isBatch) {
    return !this.isInline
      // Only writeable if not node_module in batch mode
      && isBatch ? !~this.filepath.indexOf('node_modules') : !this.isDependency;
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
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @returns {Array}
   */
  parseWorkflow (type, buildOptions) {
    if (!(type in this.workflows)) return [];

    return this.workflows[type].reduce((tasks, task) => {
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
   * @param {Boolean} asReferences
   * @returns {Array}
   */
  getAllDependencies (asReferences) {
    const key = asReferences ? 'dependencyReferences' : 'dependencies';
    const root = this;
    let deps = [];
    let depsUnique = [];

    function add (dependency, dependant) {
      const instance = dependency.instance || dependency;

      if (instance !== root) {
        deps.push(dependency);
        // Add children
        if (key in instance) {
          instance[key].forEach(function (dep) {
            // Protect against circular references
            if ((dep.instance || dep) != dependant) add(dep, dependency);
          });
        }
      }
    }

    this[key].forEach(add);

    // Reverse and filter unique
    // Prefer deeply nested duplicates
    for (let i = deps.length - 1; i >= 0; i--) {
      if (!~depsUnique.indexOf(deps[i])) depsUnique.push(deps[i]);
    }

    return depsUnique;
  }

  /**
   * Add 'dependencies'
   * @param {Array} dependencies
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   */
  addDependencies (dependencies, buildOptions) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const ignoredFiles = buildOptions.ignoredFiles || [];
    const resolveOptions = {
      fileExtensions: this.options.fileExtensions,
      type: this.type,
      sources: this.options.sources
    };

    dependencies.forEach((dependency) => {
      // Inlined/sidecar dependencies are pre-resolved
      const filepath = dependency.filepath || resolve(this.filepath, dependency.id, resolveOptions);

      // Unable to resolve filepath or create instance
      if (filepath === '') {
        warn(`dependency ${strong(dependency.id)} for ${strong(this.id)} not found`, 3);
        return;
      }

      this.dependencyReferences.push(dependency);

      // Handle disabled (ignore node_modules when watch only build)
      if (filepath === false || (buildOptions.watchOnly && ~filepath.indexOf('node_modules'))) {
        dependency.isDisabled = true;
        return;
      }

      const instance = this.options.fileFactory(filepath, this.options);

      dependency.file = instance;
      // Ignore if parent file, circular dependency, or ignored child file
      if (instance.isLocked || ~instance.dependencies.indexOf(this) || ~ignoredFiles.indexOf(filepath)) {
        dependency.isIgnored = true;
      } else if (!~this.dependencies.indexOf(instance)) {
        instance.isDependency = true;
        // Identify as inline-source dependency
        instance.isInline = 'stack' in dependency;
        this.dependencies.push(instance);
      }
    });
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
   * Run workflow sets in sequence based on 'buildOptions'
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  run (buildOptions, fn) {
    const workflows = [
      callable(this, 'runWorkflow', 'default', 'post', buildOptions),
      callable(this, 'runWorkflow', 'core', 'pre', buildOptions)
    ];

    series(workflows, (err) => {
      if (err) return fn(err);
      fn(null, this.getAllDependencies(false));
    });
  }

  /**
   * Run workflows for 'type'
   * @param {String} type
   * @param {String} includeDependencies
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  runWorkflow (type, includeDependencies, buildOptions, fn) {
    const workflow = this.parseWorkflow(type, buildOptions);
    let tasks = [];

    // Run dependencies first
    if (includeDependencies == 'pre' && this.dependencies.length) {
      tasks.push(callable(this, 'runWorkflowForDependencies', type, includeDependencies, buildOptions));
    }

    tasks.push(...workflow.map((task) => callable(this, task, buildOptions)));

    series(tasks, (err) => {
      if (err) return fn(err);
      // Run workflow for new dependencies
      if (includeDependencies == 'post' && this.dependencies.length) {
        return this.runWorkflowForDependencies(type, includeDependencies, buildOptions, fn);
      }
      fn();
    });
  }

  /**
   * Run dependency workflows for 'type'
   * @param {String} type
   * @param {String} includeDependencies
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  runWorkflowForDependencies (type, includeDependencies, buildOptions, fn) {
    parallel(this.dependencies.map((dependency) => {
      return callable(dependency, 'runWorkflow', type, includeDependencies, buildOptions);
    }), fn);
  }

  /**
   * Read and store file contents
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
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
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
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
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
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
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
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
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err, results)
   */
  write (filepath, buildOptions, fn) {
    this.runWorkflow('write', false, buildOptions, (err) => {
      if (err) return fn(err);

      const relpath = truncate(path.relative(process.cwd(), filepath));

      mkdir(filepath);
      writeFile(filepath, this.content, 'utf8');

      print(chalk.green(`built ${this.options.runtimeOptions.compress ? 'and compressed' : ''} ${strong(relpath)}`), 2);

      fn(null, [filepath, md5(this.content), Date.now()]);
    });
  }

  /**
   * Reset content
   * @param {Boolean} hard
   */
  reset (hard) {
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
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

/*
const WORKFLOW = {
  css: [
    'load',
    'parse' // Parse dependencies (@import)
  ],
  html: [
    'load',
    'parse', // Parse dependencies (partials)
    '!watchOnly:replaceReferences' // Replace relative dependency refs with absolute
  ],
  image: [
    'load'
  ],
  js: [
    'load',
    'output:replaceEnvironment', // Replace process.env
    'output:compile', // Convert to js
    'output:transpile',
    // 'output:compress:compress', // Remove dead code
    'parse', // Parse dependencies (require)
    'bundle:output:replaceReferences', // Replace relative dependency refs with absolute
    'output:inline', // Inline json and disabled refs
    'bundle:output:wrap' // Add module wrapper
  ],
  json: [
    'load'
  ],
  unknown: [
    'load'
  ]
};
const WORKFLOW_INLINEABLE = {
  css: [
    'load',
    'compress:compress'
  ],
  html: [
    'load'
  ],
  image: [
    'load',
    'compress:compress'
  ],
  js: [
    'load',
    'replaceEnvironment', // Replace process.env
    'compress:compress'
  ],
  json: [
    'load'
  ],
  unknown: [
    'load'
  ]
};
const WORKFLOW_WRITEABLE = {
  css: [
    'inline', // Inline all dependencies
    'compile', // Convert to css
    'compress:compress',
    'concat' // Add header
  ],
  html: [
    'compile', // Convert to html (compiler plugins handle partials)
    'parseInline', // Parse inline dependencies
    'inline'
  ],
  image: [
    'compress:compress'
  ],
  js: [
    'bundle:concat', // Concat dependencies
    'bundle:compress:compress'
  ],
  json: [],
  unknown: []
};

*/