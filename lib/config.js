'use strict';

const clone = require('lodash/cloneDeep');
const cnsl = require('./utils/cnsl');
const env = require('./utils/env');
const filetype = require('./utils/filetype');
const fs = require('fs');
const glob = require('glob').sync;
const match = require('minimatch');
const merge = require('lodash/merge');
const path = require('path');
const plugins = require('./utils/plugins');
const recurFs = require('recur-fs');

const DEFAULT_COMPILERS = {
  css: '',
  html: '',
  js: '',
  json: ''
};
const DEFAULT_FILE_EXTENSIONS = {
  css: ['css'],
  html: ['html'],
  image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
  js: ['js'],
  json: ['json']
};
const DEFAULT_MANIFEST = {
  js: 'buddy.js',
  json: 'buddy.json',
  pkgjson: 'package.json'
};
const DEFAULT_OPTIONS = {
  compress: false,
  deploy: false,
  grep: false,
  invert: false,
  reload: false,
  script: false,
  serve: false,
  watch: false,
  verbose: false
};
const DEFAULT_SERVER = {
  directory: '.',
  port: 8080
};
const DEFAULT_CONFIG = {
  build: {},
  compilers: merge({}, DEFAULT_COMPILERS),
  compressors: {},
  fileExtensions: merge({}, DEFAULT_FILE_EXTENSIONS),
  fileFilter: /./,
  runtimeOptions: merge({}, DEFAULT_OPTIONS),
  script: '',
  server: merge({}, DEFAULT_SERVER),
  url: '',
  workflows: {}
};
const RE_GLOB = /[\*\[\{]/;
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
    'bundled:output:replaceReferences', // Replace relative dependency refs with absolute
    'output:inline', // Inline json and disabled refs
    'bundled:output:wrap' // Add module wrapper
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
    'bundled:concat', // Concat dependencies
    'bundled:compress:compress'
  ],
  json: [],
  unknown: []
};

const hunt = recurFs.hunt.sync;
const indir = recurFs.indir;
const print = cnsl.print;
const readdir = recurFs.readdir.sync;
const strong = cnsl.strong;
const warn = cnsl.warn;
let numBuildTargets;

module.exports = {
  /**
   * Load and parse configuration file
   * Accepts optional path to file or directory
   * @param {String | Object} [configpath]
   * @param {Object} [runtimeOptions]
   * @returns {Object}
   */
  load (configpath, runtimeOptions) {
    const config = merge({}, DEFAULT_CONFIG, {
      runtimeOptions: runtimeOptions
    });

    config.runtimeOptions.version = require(path.resolve(__dirname, '../package.json')).version;
    env('VERSION', config.runtimeOptions.version);
    // Load core Buddy compilers (+ fileExtensions) and compressors
    plugins.core(config);
    this.generateFileFilter(config);
    // Retrieve config
    this.loadConfig(configpath, config);

    // Config build
    if (config.build) {
      config.build = this.parseBuild(config.build, config);
      // Error parseing
      if (!config.build) throw Error('invalid "build" data for ' + strong(config.url));
    } else {
      throw Error('no "build" data for ' + strong(config.url));
    }

    return config;
  },

  /**
   * Load configuration file at 'configpath'
   * @param {String} configpath
   * @param {Object} config
   */
  loadConfig (configpath, config) {
    let data, url;

    if ('string' == typeof configpath || configpath == null) {
      url = this.locateConfig(configpath);
      data = require(url);
      // Set current directory to location of file
      process.chdir(path.dirname(url));
      print('loaded config ' + strong(url), 0);
    // Passed in JSON object
    } else {
      data = configpath;
    }

    // Package.json
    if (data.buddy) data = data.buddy;
    // Handle super simple mode
    if (data.input) data = { build: data };

    merge(config, data);
  },

  /**
   * Locate the configuration file
   * Walks the directory tree if no file/directory specified
   * @param {String} [url]
   * @returns {String}
   */
  locateConfig (url) {
    let configpath;

    function check (dir) {
      // Support js, json, and package.json
      const urljs = path.join(dir, DEFAULT_MANIFEST.js);
      const urljson = path.join(dir, DEFAULT_MANIFEST.json);
      const urlpkgjson = path.join(dir, DEFAULT_MANIFEST.pkgjson);
      let urlFinal;

      if (fs.existsSync(urlFinal = urljs)
        || fs.existsSync(urlFinal = urljson)
        || fs.existsSync(urlFinal = urlpkgjson)) {
          return urlFinal;
      }

      return '';
    }

    if (url) {
      configpath = path.resolve(url);
      try {
        // Try default file name if passed directory
        if (!path.extname(configpath).length || fs.statSync(configpath).isDirectory()) {
          configpath = check(configpath);
          if (!configpath) throw Error('no default found');
        }
      } catch (err) {
        throw Error(strong('buddy') + ' config not found in ' + strong(path.dirname(url)));
      }

    // No url specified
    } else {
      try {
        // Find the first instance of a DEFAULT file based on the current working directory
        configpath = hunt(process.cwd(), (resource, stat) => {
          if (stat.isFile()) {
            const basename = path.basename(resource);

            return (basename == DEFAULT_MANIFEST.js || basename == DEFAULT_MANIFEST.json || basename == DEFAULT_MANIFEST.pkgjson);
          }
        }, true);
      } catch (err) {
        if (!configpath) throw Error(strong('buddy') + ' config not found');
      }
    }

    return configpath;
  },

  /**
   * Generate file filter RegExp from 'config.fileExtensions'
   * @param {Object} config
   */
  generateFileFilter (config) {
    let exts = [];

    for (const type in config.fileExtensions) {
      exts = exts.concat(config.fileExtensions[type]);
    }

    config.fileFilter = new RegExp(exts.join('$|') + '$');
  },

  /**
   * Parse and validate build targets
   * @param {Object} build
   * @param {Object} config
   * @param {Object} [parent]
   * @returns {Array}
   */
  parseBuild (build, config, parent) {
    if (!parent) numBuildTargets = 0;
    // Support basic mode with single build target
    if (!Array.isArray(build)) build = [build];

    return build.reduce((build, buildTarget) => {
      // Deprecate old formats
      if ('js' in buildTarget || 'css' in buildTarget || 'html' in buildTarget || 'targets' in buildTarget) {
        warn('this config format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help');
        return build;
      }
      // Deprecate aliases
      if (buildTarget.alias) warn(`${strong('alias')} attribute is no longer supported. Use package.json ${strong('browser')} field instead`, 1);
      // Deprecate modular
      if (buildTarget.modular) warn(`${strong('modular')} attribute has been renamed to ${strong('bundled')}`, 1);

      if (buildTarget.bootstrap == null) buildTarget.bootstrap = true;
      if (buildTarget.label == null) buildTarget.label = '';
      if (buildTarget.bundled == null || buildTarget.modular) buildTarget.bundled = true;
      buildTarget.compilers = config.compilers;
      buildTarget.compressors = config.compressors;
      buildTarget.fileExtensions = config.fileExtensions;
      buildTarget.runtimeOptions = config.runtimeOptions;
      buildTarget.sources = ['.'].concat(buildTarget.sources || []).map((source) => path.resolve(source));
      buildTarget.hasChildren = false;
      buildTarget.hasParent = !!parent;
      buildTarget.index = ++numBuildTargets;
      if (!buildTarget.hasParent) {
        buildTarget.options = buildTarget.options || {};
        plugins.external(buildTarget.version, buildTarget.options);
      } else {
        // options/version only valid for root parent build targets
        if (buildTarget.version || buildTarget.options) warn("child build targets inherit their root parent 'version' and 'options'");
        buildTarget.options = parent.options;
        buildTarget.sources = parent.sources;
      }
      delete buildTarget.version;

      this.parseInputOutput(buildTarget, config.fileFilter, config.fileExtensions, config.runtimeOptions);
      this.processWorkflows(buildTarget);
      // Ignore build targets with nulled input (no grep match)
      if (!('input' in buildTarget) || buildTarget.input != null) {
        this.parseAppServer(buildTarget, config);
        // Prevent pruning of dependencies if non-bundled batch job
        buildTarget.writeableFilterFlag = !buildTarget.bundled && buildTarget.batch;
        // Store hooks
        if (buildTarget.before) buildTarget.before = this.defineHook(buildTarget.before);
        if (buildTarget.afterEach) buildTarget.afterEach = this.defineHook(buildTarget.afterEach);
        if (buildTarget.after) buildTarget.after = this.defineHook(buildTarget.after);

        // Traverse child build targets
        if (buildTarget.build) {
          buildTarget.hasChildren = true;
          buildTarget.build = this.parseBuild(buildTarget.build, config, buildTarget);
          this.parseChildInputpaths(buildTarget);
        }
        build.push(buildTarget);
      }

      return build;
    }, []);
  },

  /**
   * Process default workflows for 'buildTarget'
   * @param {Object} buildTarget
   */
  processWorkflows (buildTarget) {
    const isCompressed = buildTarget.runtimeOptions.compress;
    const isBundled = buildTarget.bundled;
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
                case 'bundled':
                  return isBundled;
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
  },

  /**
   * Parse input/output path(s) for 'buildTarget'
   * @param {Object} buildTarget
   * @param {RegExp} fileFilter
   * @param {Object} fileExtensions
   * @param {Object} runtimeOptions
   */
  parseInputOutput (buildTarget, fileFilter, fileExtensions, runtimeOptions) {
    let outputs, outputIsDirectory;

    if (buildTarget.output) {
      outputs = buildTarget.output;

      if (!Array.isArray(outputs)) outputs = [outputs];

      if (runtimeOptions.compress && 'output_compressed' in buildTarget) {
        let outputsCompressed = buildTarget.output_compressed;

        if (!Array.isArray(outputsCompressed)) outputsCompressed = [outputsCompressed];
        if (outputsCompressed.length != outputs.length) {
          throw Error(`total number of outputs (${strong(buildTarget.output)}) do not match total number of compressed outputs (${strong(buildTarget.output_compressed)})`);
        }
        outputs = outputsCompressed;
        buildTarget.output = buildTarget.output_compressed;
      }

      outputIsDirectory = (outputs.length == 1 && !path.extname(outputs[0]).length);
    } else {
      buildTarget.outputpaths = [];
    }

    if (buildTarget.input) {
      let inputs = buildTarget.input;
      let inputsRelative = [];

      if (!Array.isArray(inputs)) inputs = [inputs];

      buildTarget.inputpaths = inputs.reduce((inputs, input) => {
        // Expand glob pattern
        if (RE_GLOB.test(input)) {
          inputs = inputs.concat(glob(input, { matchBase: true }));
        } else {
          inputs.push(input);
        }
        return inputs;
      }, []).reduce((inputs, input) => {
        input = path.resolve(input);
        // Expand directory
        if (!path.extname(input).length) {
          // Batch mode will change output behaviour if dir -> dir
          buildTarget.batch = true;
          inputs = inputs.concat(readdir(input, (resource, stat) => {
            const isFile = stat.isFile();

            // Capture relative path for dir -> dir
            if (isFile) inputsRelative.push(path.relative(input, resource));
            return isFile;
          }));
        } else {
          inputs.push(input);
          inputsRelative.push(path.basename(input));
        }
        return inputs;
      }, []).filter((input, idx) => {
        let include = true;

        // Include/exclude if grepping
        if (runtimeOptions.grep) {
          include = (buildTarget.label == runtimeOptions.grep)
            || match(input, runtimeOptions.grep, { matchBase: true });
          if (runtimeOptions.invert) include = !include;
        }
        // Exclude unknown files
        if (!fileFilter.test(input)) {
          include = false;
        }

        if (!include) inputsRelative.splice(idx, 1);
        return include;
      }).map((input) => {
        const inputpath = path.resolve(input);

        if (!fs.existsSync(inputpath)) warn(strong(input) + ' doesn\'t exist', 1);
        return inputpath;
      });

      if (!buildTarget.inputpaths.length) {
        buildTarget.input = null;
        buildTarget.inputpaths = null;
        return;
      }

      if (outputs) {
        if (buildTarget.inputpaths.length != outputs.length && !outputIsDirectory) {
          throw Error(`unable to resolve inputs (${strong(buildTarget.input)}) with outputs (${strong(buildTarget[runtimeOptions.compress ? 'output_compressed' : 'output'])})`);
        }

        buildTarget.outputpaths = buildTarget.inputpaths.map((inputpath, idx) => {
          let outputpath = '';

          if (outputIsDirectory) {
            // Preserve relative paths when batching
            outputpath = path.join(path.resolve(outputs[0]), inputsRelative[idx]);
          } else {
            outputpath = path.resolve(outputs[idx]);
          }

          const extension = path.extname(outputpath);
          const type = filetype(inputpath, fileExtensions);

          // Resolve missing extension
          if (!extension) outputpath += `.${type}`;
          if (type != 'image' && extension != `.${type}`) outputpath = outputpath.replace(extension, `.${type}`);

          return outputpath;
        });
      }
    }
  },

  /**
   * Determine if 'buildTarget' is app server
   * @param {Object} buildTarget
   * @param {Object} config
   */
  parseAppServer (buildTarget, config) {
    // Test if 'p' is in 'dirs'
    function contains (dirs, p) {
      if (!Array.isArray(dirs)) dirs = [dirs];
      return dirs.some((dir) => {
        return indir(dir, p);
      });
    }

    if (config.server && config.server.file) {
      buildTarget.isAppServer = contains(buildTarget.inputpaths, path.resolve(config.server.file));
    }
  },

  /**
   * Parse nested child input paths
   * @param {Object} buildTarget
   */
  parseChildInputpaths (buildTarget) {
    function parse (build) {
      let inputpaths = [];

      build.forEach((buildTarget) => {
        inputpaths = inputpaths.concat(buildTarget.inputpaths, buildTarget.build ? parse(buildTarget.build) : []);
      });

      return inputpaths;
    }

    buildTarget.childInputpaths = parse(buildTarget.build);
  },

  /**
   * Convert hook path or expression to Function
   * @param {String} hook
   * @returns {Function}
   */
  defineHook (hook) {
    // Load file content if filepath
    if (path.extname(hook) && (~hook.indexOf('/') || ~hook.indexOf(path.sep))) {
      let hookpath;

      if (fs.existsSync(hookpath = path.resolve(hook))) {
        hook = fs.readFileSync(hookpath, 'utf8');
      } else {
        throw Error('hook ('
          + strong(hook)
          + ') isn\'t a valid path');
      }
    }

    return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
  }
};