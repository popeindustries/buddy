'use strict';

const { apply, ensureAsync, series, parallel } = require('async');
const { debug, print, strong, warn } = require('./utils/cnsl');
const { resolve } = require('./identify-resource');
const { truncate } = require('./utils/string');
const { readFileSync: readFile, writeFileSync: writeFile } = require('fs');
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
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Object} runtimeOptions
   *  - {Array} sources
   */
  constructor (id, filepath, type, options) {
    this.content = '';
    this.compiledContent = '';
    this.encoding = 'utf8';
    this.date = Date.now();
    this.dependencies = [];
    this.fileContent = '';
    this.filepath = filepath;
    this.hash = '';
    this.id = id;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.options = options;
    this.type = type;
    this.workflow = {
      default: ['load', 'parse'],
      extended: [],
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
    return isBatch
      // Only writeable if not node_module in batch mode
      ? !~this.filepath.indexOf('node_modules')
      : !this.isDependency;
  }

  /**
   * Retrieve inlineable state
   * @returns {Boolean}
   */
  isInlineable () {
    return this.isInline;
  }

  /**
   * Retrieve workflow for 'buildOptions'
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} output
   * @returns {Array}
   */
  getWorkflow (buildOptions) {
    return this.workflow;
  }

  /**
   * Retrieve flattened dependency tree
   * @returns {Array}
   */
  getAllDependencies () {
    const root = this;
    let deps = [];
    let depsUnique = [];

    function add (dependency, dependant) {
      const instance = dependency.instance;

      if (instance !== root) {
        deps.push(dependency);
        // Add children
        instance.dependencies.forEach((dep) => {
          // Protect against circular references
          if ((dep.instance || dep) != dependant) add(dep, dependency);
        });
      }
    }

    this.dependencies.forEach(add);

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
   * @param {Object} options
   */
  addDependencies (dependencies, options) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const ignoredFiles = options.ignoredFiles || [];
    const resolveOptions = {
      fileExtensions: this.options.fileExtensions,
      type: this.type,
      sources: this.options.sources
    };

    dependencies.forEach((dependency) => {
      const filepath = resolve(this.filepath, dependency.filepath, resolveOptions);
      let instance;

      if (filepath !== '') {
        // Handle disabled (ignore node_modules when watching)
        if (filepath === false || (options.watching == 2 && ~filepath.indexOf('node_modules'))) {
          dependency.isDisabled = true;
        } else if (instance = this.options.fileFactory(filepath, this.options)) {
          // Store instance
          dependency.file = instance;
          // Ignore if parent file, circular dependency, or ignored child file
          if (instance.isLocked || ~instance.dependencies.indexOf(this) || ~ignoredFiles.indexOf(filepath)) {
            dependency.isIgnored = true;
          } else if (!~this.dependencies.indexOf(instance)) {
            instance.isDependency = true;
            instance.isInline = 'stack' in dependency;
          }
        }
        this.dependencies.push(dependency);
      }

      // Unable to resolve filepath
      if (!instance && !dependency.isDisabled) {
        warn(`dependency ${strong(dependency.filepath)} for ${strong(this.id)} not found`, 3);
      }
    });
  }

  /**
   * Run workflow tasks in sequence based on 'buildOptions'
   * @param {Object} buildOptions
   *   - {Boolean} bootstrap
   *   - {Boolean} boilerplate
   *   - {Array} ignoredFiles
   *   - {Boolean} includeHeader
   *   - {Boolean} includeHelpers
   *   - {Boolean} watching
   * @param {Function} fn(err)
   */
  run (buildOptions, fn) {
    // series(workflow.map((task) => {
    //   // Memoize & prevent long stacks
    //   return ensureAsync(this[task].bind(this, options));
    // }), (err) => {
    //   // Return dependencies if parsed
    //   fn(err, (~workflow.indexOf('parse') || ~workflow.indexOf('parseInline'))
    //     ? this.dependencies
    //     : []
    //   );
    // });
  }

  runWorkflowDefault (buildOptions, fn) {
    this.runWorkflow('default', buildOptions, (err) => {
      if (err) return fn(err);

      if (!this.dependencies.length) return fn();

      parallel(this.dependencies.map((dependency) => {

      }), fn);
    });

  }

  runWorkflowExtended (buildOptions, fn) {

  }

  /**
   *
   */
  runWorkflow (workflowType, buildOptions, fn) {
    const workflow = this.getWorkflow(buildOptions);

    if (!workflow.length) return fn();

    series(workflow.map((task) => {
      return apply(this[task], buildOptions);
    }), fn);
  }

  /**
   * Read and store file contents
   * @param {Object} options
   * @param {Function} fn(err)
   */
  load (options, fn) {
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
   * @param {Object} options
   * @param {Function} fn(err)
   */
  parse (options, fn) {
    debug('parse: ' + strong(this.relpath), 4);
    fn();
  }

  /**
   * Compile file contents [no-op]
   * @param {Object} options
   * @param {Function} fn(err)
   */
  compile (options, fn) {
    debug('compile: ' + strong(this.relpath), 4);
    fn();
  }

  /**
   * Compress file contents [no-op]
   * @param {Object} options
   * @param {Function} fn(err)
   */
  compress (options, fn) {
    debug('compile: ' + strong(this.relpath), 4);
    fn();
  }

  /**
   * Write file contents to disk
   * @param {String} filepath
   * @returns {Array}
   */
  write (filepath) {
    // TODO: run 'write' workflow
    const relpath = truncate(path.relative(process.cwd(), filepath));

    mkdir(filepath);
    writeFile(filepath, this.content, 'utf8');

    print(chalk.green(`built ${this.options.runtimeOptions.compress ? 'and compressed' : ''} ${strong(relpath)}`), 2);

    return [filepath, md5(this.content), Date.now()];
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
    if (!hard) {
      this.content = this.fileContent;
      this.compiledContent = '';
    } else {
      this.content = this.fileContent = this.compiledContent = '';
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