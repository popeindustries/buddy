'use strict';

const { apply, ensureAsync, series, parallel } = require('async');
const { debug, print, strong, warn } = require('./utils/cnsl');
const { resolve } = require('./identify-resource');
const { truncate } = require('./utils/string');
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
   *  - {Object} runtimeOptions
   *  - {Array} sources
   */
  constructor (id, filepath, type, options) {
    this.content = '';
    this.compiledContent = '';
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
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
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
      const filepath = resolve(this.filepath, dependency.id, resolveOptions);

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
   * Run workflow tasks in sequence based on 'buildOptions'
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watching
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

  /**
   * Run workflows for 'workflowType'
   * @param {String} workflowType
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watching
   * @param {Function} fn(err)
   * @returns {null}
   */
  runWorkflow (workflowType, buildOptions, fn) {
    const workflow = this.getWorkflow(buildOptions)[workflowType];
    const hasDependencies = this.dependencies.length > 0;
    let tasks = [];

    if (!workflow || !workflow.length) return fn();

    // Run dependencies first
    if (hasDependencies) {
      tasks.push(callable(this, 'runWorkflowForDependencies', workflowType, buildOptions));
    }

    tasks.push(...workflow.map((task) => {
      return callable(this, task, buildOptions);
    }));

    series(tasks, (err) => {
      if (err) return fn(err);
      // Run workflow for new dependencies
      if (this.dependencies.length && !hasDependencies) {
        return this.runWorkflowForDependencies(workflowType, buildOptions, fn);
      }
      fn();
    });
  }

  /**
   * Run dependency workflows for 'workflowType'
   * @param {String} workflowType
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watching
   * @param {Function} fn(err)
   * @returns {null}
   */
  runWorkflowForDependencies (workflowType, buildOptions, fn) {
    if (!this.dependencies.length) return fn();

    parallel(this.dependencies.map((dependency) => {
      return callable(dependency, 'runWorkflow', workflowType, buildOptions);
    }), fn);
  }

  /**
   * Read and store file contents
   * @param {Object} buildOptions
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
   * @param {Function} fn(err)
   */
  parse (buildOptions, fn) {
    debug(`parse: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Compile file contents [no-op]
   * @param {Object} buildOptions
   * @param {Function} fn(err)
   */
  compile (buildOptions, fn) {
    debug(`compile: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Compress file contents [no-op]
   * @param {Object} options
   * @param {Function} fn(err)
   */
  compress (options, fn) {
    debug(`compile: ${strong(this.relpath)}`, 4);
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
    this.dependencyReferences = [];
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

/*
const WORKFLOW = {
  css: [
    'load',
    'parse' // Parse dependencies (@import)
  ],
  html: [
    'load',
    'parse', // Parse dependencies (partials)
    'output:replaceReferences' // Replace relative dependency refs with absolute
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

/*  processWorkflows (buildTarget) {
    const isCompressed = buildTarget.runtimeOptions.compress;
    const isBundle = buildTarget.bundle;
    const isOutput = !!buildTarget.output;

    function parseConditionals (workflows) {
      for (const type in workflows) {
        workflows[type] = workflows[type].reduce((tasks, task) => {
          if (~task.indexOf(':')) {
            let conditions = task.split(':');

            task = conditions.pop();
            const passed = conditions.every((condition) => {
              switch (condition) {
                case 'compress':
                  return isCompressed;
                case 'bundle':
                  return isBundle;
                case 'output':
                  return isOutput;
              }
            });

            if (!passed) return tasks;
          }
          tasks.push(task);
          return tasks;
        }, []);
      }
      return workflows;
    }

    buildTarget.workflows = {
      all: parseConditionals(clone(WORKFLOW)),
      inlineable: parseConditionals(clone(WORKFLOW_INLINEABLE)),
      writeable: parseConditionals(clone(WORKFLOW_WRITEABLE))
    };
  },*/