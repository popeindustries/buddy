'use strict';

const { debug, strong, warn } = require('./utils/cnsl');
const { generateUniqueFilepath, isUniqueFilepath } = require('./utils/filepath');
const { getLocationFromIndex, sourceMapCommentStrip, truncate } = require('./utils/string');
const { mkdir: { sync: mkdir } } = require('recur-fs');
const { readFileSync: readFile, writeFileSync: writeFile } = require('fs');
const { resolve } = require('./resolver');
const { SourceMapGenerator } = require('source-map');
const { walk } = require('./utils/tree');
const callable = require('./utils/callable');
const fs = require('fs');
const md5 = require('md5');
const nativeModules = require('./utils/nativeModules');
const parallel = require('async/parallel');
const path = require('path');
const series = require('async/series');
const sourceMap = require('./utils/sourceMap');

const RE_ESCAPE_ID = /[@#._-\s/\\]/g;
const RE_WIN_LINE_ENDINGS = /\r\n/g;
const RE_WIN_SEPARATOR = /\\/g;
const WORKFLOW_INLINEABLE = ['load'];
const WORKFLOW_STANDARD = [
  'load',
  'parse',
  'runWorkflowForDependencies'
];

module.exports = class File {
  /**
   * Constructor
   * @param {String} id
   * @param {String} filepath
   * @param {String} type
   * @param {Object} options
   *  - {Boolean} browser
   *  - {Function} buildFactory
   *  - {FileCache} fileCache
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {String} sourceroot
   *  - {Array} npmModulepaths
   *  - {Object} pluginOptions
   *  - {ResolverCache} resolverCache
   *  - {Object} runtimeOptions
   *  - {String} webroot
   */
  constructor (id, filepath, type, options) {
    this.allDependencies = null;
    this.allDependencyReferences = null;
    this.content = '';
    this.fileContent = '';
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.encoding = 'utf8';
    this.extension = path.extname(filepath).slice(1);
    this.filepath = filepath;
    this.hash = '';
    this.hasMaps = options.runtimeOptions.maps;
    this.hasUnresolvedDependencies = false;
    this.id = id;
    this.idSafe = id.replace(RE_ESCAPE_ID, '');
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.map = null;
    this.mapUrl = '';
    this.name = path.basename(filepath);
    this.options = options;
    this.relpath = truncate(path.relative(process.cwd(), filepath));
    this.relUrl = this.relpath.replace(RE_WIN_SEPARATOR, '/');
    this.totalLines = 0;
    this.type = type;
    this.writepath = '';
    this.writeDate = 0;
    this.writeHash = '';
    this.writeUrl = '';
    this.workflows = {
      standard: [WORKFLOW_STANDARD],
      standardWatch: [WORKFLOW_STANDARD],
      inlineable: [WORKFLOW_INLINEABLE],
      writeable: [[]]
    };

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
      && batch ? !this.filepath.includes('node_modules') : !this.isDependency;
  }

  /**
   * Retrieve inlineable state
   * @returns {Boolean}
   */
  isInlineable () {
    return this.isInline;
  }

  /**
   * Set 'content'
   * @param {String} content
   */
  setContent (content) {
    this.content = content;

    if (this.encoding == 'utf8') {
      this.content = this.content || '';
      this.totalLines = this.content
        ? this.content.split('\n').length
        : 0;
    }
  }

  /**
   * Set 'map'
   * @param {Object} [map]
   */
  setMap (map) {
    if (!this.hasMaps || this.encoding != 'utf8') return;

    this.map = !map
      ? sourceMap.create(this.fileContent, this.relUrl)
      : map instanceof SourceMapGenerator
        ? map
        : sourceMap.createFromMap(map, this.fileContent, this.relUrl);
  }

  /**
   * Append 'content' of content
   * @param {String|File} content
   */
  appendContent (content) {
    let contentLines = 0;

    if ('string' == typeof content) {
      contentLines = content.split('\n').length;
    } else {
      if (this.map) sourceMap.append(this.map, content.map, this.totalLines);
      contentLines = content.totalLines;
      content = content.content;
    }
    // New line if not first
    this.content += `${this.content ? '\n' : ''}${content}`;
    this.totalLines += contentLines;
  }

  /**
   * Append 'content' of content
   * @param {String|File} content
   */
  prependContent (content) {
    let contentLines = 0;

    if ('string' == typeof content) {
      contentLines = content.split('\n').length;
      if (this.map) sourceMap.prepend(this.map, null, contentLines);
    } else {
      contentLines = content.totalLines;
      if (this.map) sourceMap.prepend(this.map, content.map, contentLines);
      content = content.content;
    }
    this.content = `${content}${this.content ? '\n' : ''}` + this.content;
    this.totalLines += contentLines;
  }

  /**
   * Replace 'string' at 'index' with 'content'
   * @param {String|Array} string
   * @param {Number} [index]
   * @param {String|File} [content]
   */
  replaceContent (string, index, content) {
    // Convert to batch
    if (!Array.isArray(string)) string = [[string, index, content]];
    index = string.map((args) => args[1]);

    const location = getLocationFromIndex(this.content, index);
    let offsetIndex = 0;
    let offsetLine = 0;

    const replace = (args, idx) => {
      let [string, index, content] = args;
      let line = location[idx].line;
      let contentLines = 0;

      index += offsetIndex;
      line += offsetLine;

      if ('string' == typeof content) {
        contentLines = content.split('\n').length - 1;
        if (contentLines && this.map) sourceMap.insert(this.map, null, contentLines, line);
      } else {
        contentLines = content.totalLines - 1;
        if (this.map) sourceMap.insert(this.map, content.map, contentLines, line);
        content = content.content;
      }

      this.content = this.content.substring(0, index)
        + content
        + this.content.substring(index + string.length);
      this.totalLines += contentLines;

      offsetIndex += content.length - string.length;
      offsetLine += contentLines;
    };

    string.forEach(replace);
  }

  /**
   * Retrieve flattened dependency tree
   * @returns {Array}
   */
  getAllDependencies () {
    if (!this.allDependencies) {
      let dependencies = [];

      walk(this.dependencies, (file) => {
        if (!dependencies.includes(file)) {
          dependencies.push(file);
          return file.dependencies;
        }
      });

      this.allDependencies = dependencies;
    }

    return this.allDependencies;
  }

  /**
   * Retrieve flattened dependency reference tree
   * @returns {Array}
   */
  getAllDependencyReferences () {
    if (!this.allDependencyReferences) {
      let references = [];
      let seen = {};

      walk(this.dependencyReferences, (reference) => {
        if (!reference.file || !seen[reference.file.id]) {
          references.push(reference);
          if (reference.file) {
            seen[reference.file.id] = true;
            return reference.file.dependencyReferences;
          }
        }
      });

      this.allDependencyReferences = references;
    }

    return this.allDependencyReferences;
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   */
  addDependencies (dependencies, buildOptions) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const { browser = true, ignoredFiles = [], watchOnly = false } = buildOptions;
    const { fileFactory } = this.options;
    const resolveOptions = {
      browser: this.options.browser,
      cache: this.options.resolverCache,
      fileExtensions: this.options.fileExtensions
    };

    dependencies.forEach((dependency) => {
      // Inlined/sidecar dependencies are pre-resolved
      let filepath = dependency.filepath;

      if (!filepath || !fs.existsSync(filepath)) filepath = resolve(this.filepath, dependency.id, resolveOptions);

      // Unable to resolve filepath or create instance
      if (filepath === '') {
        dependency.isUnresolved = true;
        this.hasUnresolvedDependencies = true;
        warn(`dependency ${strong(dependency.id)} for ${strong(this.relpath)} not found`, 3);
        return;
      }

      this.dependencyReferences.push(dependency);

      // Handle disabled, including native modules (force ignore of node_modules when watch only build)
      if (filepath === false || (watchOnly && filepath.includes('node_modules'))) {
        // Don't disable native modules on server
        dependency.isDisabled = browser ? true : !nativeModules.includes(dependency.id);
        return;
      }

      const file = dependency.file = fileFactory(filepath, this.options);

      // Ignore if parent file or ignored child file
      if (file.isLocked || ignoredFiles.includes(filepath)) {
        dependency.isIgnored = true;
        return;
      }

      // Identify as inline-source dependency
      file.isInline = 'stack' in dependency;

      // Handle own dependency
      if (!file.isDependency) {
        file.isDependency = true;
        this.dependencies.push(file);
      }
    });
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   * @returns {null}
   */
  run (type, buildOptions, fn) {
    type = buildOptions.watchOnly ? type + 'Watch' : type;
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Array} [dependencies]
   * @param {Function} fn(err)
   */
  runForDependencies (type, buildOptions, dependencies, fn) {
    dependencies = dependencies || this.dependencies;
    parallel(dependencies.map((dependency) => {
      return callable(dependency, 'run', type, buildOptions);
    }), fn);
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @returns {Array}
   */
  parseWorkflow (type, index, buildOptions) {
    if (!this.workflows[type] || !this.workflows[type][index]) return [];

    return this.workflows[type][index].reduce((tasks, task) => {
      if (task.includes(':')) {
        let conditions = task.split(':');

        task = conditions.pop();
        const passed = conditions.every((condition) => {
          const negative = condition.charAt(0) == '!';

          condition = negative ? condition.slice(1) : condition;
          const test = (condition in buildOptions)
            ? buildOptions[condition]
            : this[condition];

          return negative ? !test : test;
        });

        if (!passed) return tasks;
      }
      tasks.push(task);
      return tasks;
    }, []);
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  runWorkflow (type, index, buildOptions, fn) {
    const workflow = this.parseWorkflow(type, index, buildOptions);
    const tasks = workflow.map((task) => {
      return (task == 'runWorkflowForDependencies')
        ? callable(this, task, type, index, buildOptions)
        : callable(this, task, buildOptions);
    });

    series(tasks, (err) => {
      if (err) return fn(err);
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  runWorkflowForDependencies (type, index, buildOptions, fn) {
    parallel(this.dependencies.map((dependency) => {
      return callable(dependency, 'runWorkflow', type, index, buildOptions);
    }), fn);
  }

  /**
   * Read file content
   * @returns {String|Buffer}
   */
  readFileContent () {
    let content = readFile(this.filepath, this.encoding);

    if ('string' == typeof content) {
      content = content.replace(RE_WIN_LINE_ENDINGS, '\n');
      content = sourceMapCommentStrip(content);
    }

    return content;
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  load (buildOptions, fn) {
    if (!this.fileContent) {
      this.fileContent = this.readFileContent();
      this.hash = md5(this.fileContent);

      debug(`load: ${strong(this.relpath)}`, 4);
    }

    this.setContent(this.fileContent);
    this.setMap();

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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  parse (buildOptions, fn) {
    warn(`no parser for: ${strong(this.relpath)}`, 4);
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  compile (buildOptions, fn) {
    warn(`no compiler for: ${strong(this.relpath)}`, 4);
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
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  compress (buildOptions, fn) {
    warn(`no compressor for: ${strong(this.relpath)}`, 4);
    fn();
  }

  /**
   * Prepare for writing
   * @param {String} filepath
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   */
  prepareForWrite (filepath, buildOptions) {
    const { sourceroot, webroot } = this.options;

    this.writeDate = Date.now();
    // Hash based on content + dependencies
    this.writeHash = md5([this.content, ...this.getAllDependencies().map((file) => file.content)].join(''));

    // Generate unique path
    if (isUniqueFilepath(filepath)) {
      // Disable during watch otherwise css reloading won't work
      filepath = generateUniqueFilepath(filepath, !this.options.runtimeOptions.watch ? this.writeHash : false);
    }

    mkdir(filepath);
    this.writepath = filepath;
    this.writeUrl = `/${path.relative(webroot, filepath).replace(path.sep, '/')}`;
    this.mapUrl = (sourceroot ? `${sourceroot}/` : '') + path.basename(this.writepath) + '.map';
  }

  /**
   * Write file contents to disk
   * @param {Object} buildOptions
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Boolean} helpers
   *  - {Array} ignoredFiles
   *  - {Boolean} import
   *  - {Boolean} watchOnly
   * @param {Function} fn(err, results)
   */
  write (buildOptions, fn) {
    this.run('writeable', buildOptions, (err) => {
      if (err) return fn(err);

      if (this.hasMaps && this.map) {
        writeFile(this.writepath + '.map', this.map.toString(), 'utf8');
        this.content += `${buildOptions.compress ? '' : '\n\n\n'}//# sourceMappingURL=${this.mapUrl}`;
      }

      writeFile(this.writepath, this.content, this.encoding);

      fn(null, {
        content: this.content,
        filepath: this.writepath,
        type: this.type
      });
    });
  }

  /**
   * Reset content
   * @param {Boolean} hard
   */
  reset (hard) {
    this.allDependencies = null;
    this.allDependencyReferences = null;
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.hasUnresolvedDependencies = false;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.mapUrl = '';
    this.writepath = '';
    this.writeDate = 0;
    this.writeHash = '';
    this.writeUrl = '';
    if (!hard) {
      this.setContent(this.fileContent);
    } else {
      this.content = '';
      this.fileContent = '';
      this.hash = '';
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