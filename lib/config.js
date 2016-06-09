'use strict';

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
  sources: ['.'],
  url: '',
  workflows: {}
};
const RE_GLOB = /[\*\[\{]/;

const hunt = recurFs.hunt.sync;
const indir = recurFs.indir;
const print = cnsl.print;
const readdir = recurFs.readdir.sync;
const strong = cnsl.strong;
const warn = cnsl.warn;

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
    env('version', config.runtimeOptions.version);
    // Process workflows
    this.processWorkflows(config);
    // Retrieve compilers (+ fileExtensions) and compressors
    plugins(config);
    // Retrieve config
    this.loadConfig(configpath, config);
    this.generateFileFilter(config);

    // Config build
    if (config.build) {
      config.sources = config.sources.concat(config.build.sources || []).map((source) => {
        return path.resolve(source);
      });
      config.build = this.parseTargets([config.build], config);
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
   * Parse and validate build 'targets'
   * @param {Array} targets
   * @param {Object} config
   * @returns {Array}
   */
  parseTargets (targets, config) {
    return targets.reduce((targets, target) => {
      // Deprecate old format
      if ('js' in target || 'css' in target || 'html' in target) {
        warn('this config format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help');
        return targets;
      }
      // Deprecate aliases
      if (target.alias) warn(`${strong('alias')} attribute is no longer supported. Use package.json ${strong('browser')} field instead`, 1);

      if (target.bootstrap == null) target.bootstrap = true;
      if (target.label == null) target.label = '';
      if (target.modular == null) target.modular = true;
      target.isRoot = !target.input;

      this.parseInputOutput(target, config.fileFilter, config.fileExtensions, config.runtimeOptions);
      // Ignore targets with nulled input (no grep match)
      if (!('input' in target) || target.input != null) {
        // this.parseOutput(target, config.fileExtensions, config.runtimeOptions);
        this.parseAppServer(target, config);
        // Don't prune dependencies if non-modular batch job
        target.writeableFilterFlag = !target.modular && target.batch;
        // Store hooks
        if (target.before) target.before = this.defineHook(target.before);
        if (target.afterEach) target.afterEach = this.defineHook(target.afterEach);
        if (target.after) target.after = this.defineHook(target.after);

        // Traverse child targets
        if (target.targets) {
          target.hasChildren = true;
          target.targets = this.parseTargets(target.targets, config).map((childTarget) => {
            childTarget.hasParent = !target.isRoot;
            return childTarget;
          });
          this.parseChildInputpaths(target);
        }
        targets.push(target);
      }

      return targets;
    }, []);
  },

  /**
   * Process default workflows
   * @param {Object} config
   */
  processWorkflows (config) {
    config.workflows = [
      // Step 1
      {
        css: [
          'load',
          // Parse dependencies (@import)
          'parse'
        ],
        html: [
          'load',
          // Parse dependencies (partials)
          'parse'
        ],
        image: [
          'load'
        ],
        js: [
          'load',
          // Replace process.env
          'output:replaceEnvironment',
          // Convert to js
          'output:compile',
          // Remove dead code
          'output:compress:compress',
          // Parse dependencies (require)
          'parse',
          // Replace relative dependency refs with absolute
          'modular:output:replaceReferences',
          // Add module wrapper
          'modular:output:wrap'
        ],
        json: [
          'load'
        ],
        unknown: [
          'load'
        ]
      },
      // Step 2
      {
        css: [
          'inlineable:load',
          'inlineable:compress:compress'
        ],
        html: [
          // Replace relative inline refs with absolute
          'output:replaceReferences',
          // Convert to html (compiler plugins handle partials)
          'writeable:output:compile',
          // Parse inline dependencies
          'writeable:output:parseInline',

          'inlineable:load'
        ],
        image: [
          'inlineable:load',
          'inlineable:compress:compress'
        ],
        js: [
          // Inline json and disabled refs
          'output:inline',

          'inlineable:load',
          // Replace process.env
          'inlineable:replaceEnvironment',
          'inlineable:compress:compress'
        ],
        json: [
          'inlineable:load'
        ],
        unknown: [
          'inlineable:load'
        ]
      },
      // Step 3
      {
        css: [
          // Inline all dependencies
          'writeable:output:inline',
          // Convert to css
          'writeable:output:compile',
          'writeable:output:compress:compress',
          // Add header
          'writeable:output:concat'
        ],
        html: [
          'writeable:output:inline'
        ],
        image: [
          'writeable:output:compress:compress'
        ],
        js: [
          // Concat dependencies
          'writeable:modular:output:concat',
          'writeable:modular:output:compress:compress'
        ],
        json: [],
        unknown: []
      }
    ];
  },

  /**
   * Parse input/output path(s) for 'target'
   * @param {Object} target
   * @param {RegExp} fileFilter
   * @param {Object} fileExtensions
   * @param {Object} runtimeOptions
   */
  parseInputOutput (target, fileFilter, fileExtensions, runtimeOptions) {
    let outputs, outputIsDirectory;

    if (target.output) {
      outputs = target.output;

      if (!Array.isArray(outputs)) outputs = [outputs];

      if (runtimeOptions.compress && 'output_compressed' in target) {
        let outputsCompressed = target.output_compressed;

        if (!Array.isArray(outputsCompressed)) outputsCompressed = [outputsCompressed];
        if (outputsCompressed.length != outputs.length) {
          throw Error(`total number of outputs (${strong(target.output)}) do not match total number of compressed outputs (${strong(target.output_compressed)})`);
        }
        outputs = outputsCompressed;
        target.output = target.output_compressed;
      }

      outputIsDirectory = (outputs.length == 1 && !path.extname(outputs[0]).length);
    } else {
      target.outputpaths = [];
    }

    if (target.input) {
      let inputs = target.input;
      let inputsRelative = [];

      if (!Array.isArray(inputs)) inputs = [inputs];

      target.inputpaths = inputs.reduce((inputs, input) => {
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
          target.batch = true;
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
          include = (target.label == runtimeOptions.grep)
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

      if (!target.inputpaths.length) {
        target.input = null;
        target.inputpaths = null;
        return;
      }

      if (outputs) {
        if (target.inputpaths.length != outputs.length && !outputIsDirectory) {
          throw Error(`unable to resolve inputs (${strong(target.input)}) with outputs (${strong(target[runtimeOptions.compress ? 'output_compressed' : 'output'])})`);
        }

        target.outputpaths = target.inputpaths.map((inputpath, idx) => {
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
   * Determine if 'target' is app server
   * @param {Object} target
   * @param {Object} config
   */
  parseAppServer (target, config) {
    // Test if 'p' is in 'dirs'
    function contains (dirs, p) {
      if (!Array.isArray(dirs)) dirs = [dirs];
      return dirs.some((dir) => {
        return indir(dir, p);
      });
    }

    if (config.server && config.server.file) {
      target.appServer = contains(target.inputpaths, path.resolve(config.server.file));
    }
  },

  /**
   * Parse nested child input paths
   * @param {Object} target
   */
  parseChildInputpaths (target) {
    function parse (targets) {
      let inputpaths = [];

      targets.forEach((target) => {
        inputpaths = inputpaths.concat(target.inputpaths, target.targets ? parse(target.targets) : []);
      });

      return inputpaths;
    }

    target.childInputpaths = parse(target.targets);
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