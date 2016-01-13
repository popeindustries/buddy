'use strict';

const clone = require('lodash/lang/clone')
  , cnsl = require('./utils/cnsl')
  , flatten = require('lodash/array/flatten')
  , fs = require('fs')
  , glob = require('glob').sync
  , match = require('minimatch')
  , merge = require('lodash/object/merge')
  , path = require('path')
  , recurFs = require('recur-fs')

  , DEFAULT_COMPILERS = {
      css: '',
      html: '',
      js: ''
    }
  , DEFAULT_FILE_EXTENSIONS = {
      css: ['css'],
      html: ['html'],
      image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
      js: ['js', 'json']
    }
  , DEFAULT_MANIFEST = {
      js: 'buddy.js',
      json: 'buddy.json',
      pkgjson: 'package.json'
    }
  , DEFAULT_OPTIONS = {
      compress: false,
      deploy: false,
      grep: false,
      invert: false,
      lazy: false,
      lint: false,
      reload: false,
      script: false,
      serve: false,
      watch: false,
      verbose: false
    }
  , DEFAULT_SERVER = {
      directory: '.',
      port: 8080
    }
  , DEFAULT_CONFIG = {
      build: {},
      compilers: merge({}, DEFAULT_COMPILERS),
      compressors: {},
      fileExtensions: merge({}, DEFAULT_FILE_EXTENSIONS),
      runtimeOptions: merge({}, DEFAULT_OPTIONS),
      script: '',
      server: merge({}, DEFAULT_SERVER),
      sources: ['.'],
      url: '',
      workflows: {}
    }
  , RE_GLOB = /[\*\[\{]/
  , RE_PLUGIN = /^buddy-plugin-|^transfigure-/

  , hunt = recurFs.hunt.sync
  , indir = recurFs.indir
  , print = cnsl.print
  , strong = cnsl.strong
  , walk = recurFs.walk.sync
  , warn = cnsl.warn;

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
    // Process workflows
    this.processWorkflows(config);
    // Retrieve compilers (+ fileExtensions) and compressors
    this.loadPlugins(config);
    // Retrieve config
    this.loadConfig(configpath, config);

    // Config build
    if (config.build) {
      config.build = this.parse([config.build], config);
      // Error parseing
      if (!config.build) throw new Error('invalid "build" data for ' + strong(config.url));
    } else {
      throw new Error('no "build" data for ' + strong(config.url));
    }

    return config;
  },

  /**
   * Load plugins
   * @param {Object} config
   */
  loadPlugins (config) {
    const cwd = process.cwd();

    try {
      walk(path.resolve(__dirname, '..'), (resource, stat) => {
        // Stop if out of buddy/project directory
        if (!~resource.indexOf(`${path.sep}buddy${path.sep}`) && !~resource.indexOf(cwd)) return true;

        if (stat.isDirectory()) {
          const basename = path.basename(resource);

          if (RE_PLUGIN.test(basename)) {
            this.registerPlugin(resource, config);
          // Check inside node_modules
          } else if (path.basename(basename) == 'node_modules') {
            fs.readdirSync(resource)
              .filter((file) => {
                return RE_PLUGIN.test(file);
              })
              .forEach((file) => {
                this.registerPlugin(path.join(resource, file), config);
              });
          }
        }
      });
    } catch (err) {
      // Stop here
    }
  },

  /**
   * Register plugin 'resource'
   * @param {String} resource
   * @param {Object} config
   * @returns {null}
   */
  registerPlugin (resource, config) {
    let module;

    try {
      module = require(resource);
    } catch (err) {
      return warn('unable to load plugin ' + strong(resource));
    }

    if (module.registration) {
      // Compiler
      if (module.registration.extensions
        && module.compile
        && 'function' == typeof module.compile) {
          const types = module.registration.extensions;

          for (const type in types) {
            const exts = types[type];

            // Convert to array
            if ('string' == typeof exts) exts = [exts];
            exts.forEach((ext) => {
              // Don't overwrite if already registered
              if (!config.compilers[ext]) {
                // Store
                if (!~config.fileExtensions[type].indexOf(ext)) config.fileExtensions[type].push(ext);
                config.compilers[ext] = module;
                print('registered compiler plugin ' + strong(module.registration.name) + ' for .' + ext, 2);
              }
            });
          }
      } else if (module.registration.type
        && module.compress
        && 'function' == typeof module.compress) {
          const type = module.registration.type;

          // Don't overwrite if already registered
          if (!config.compressors[type]) {
            // Store
            config.compressors[type] = module;
            print('registered compressor plugin ' + strong(module.registration.name) + ' for ' + type, 2);
          }
      } else {
        warn('invalid plugin ' + strong(resource));
      }
    } else {
      warn('invalid plugin ' + strong(resource));
    }
  },

  /**
   * Load configuration file at 'configpath'
   * @param {String} configpath
   * @param {Object} config
   */
  loadConfig (configpath, config) {
    let data, url;

    if ('string' == typeof configpath || configpath == null) {
      url = this.locate(configpath);
      data = require(url);
      // Set current directory to location of file
      process.chdir(path.dirname(url));
      print('loaded config ' + strong(url), 1);
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
  locate (url) {
    let configpath;

    function check (dir) {
      // Support js, json, and package.json
      const urljs = path.join(dir, DEFAULT_MANIFEST.js)
        , urljson = path.join(dir, DEFAULT_MANIFEST.json)
        , urlpkgjson = path.join(dir, DEFAULT_MANIFEST.pkgjson);

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
          if (!configpath) throw new Error('no default found');
        }
      } catch (err) {
        throw new Error(strong('buddy') + ' config not found in ' + strong(path.dirname(url)));
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
        if (!configpath) throw new Error(strong('buddy') + ' config not found');
      }
    }

    return configpath;
  },

  /**
   * Parse and validate build 'targets'
   * @param {Array} targets
   * @param {Object} config
   * @returns {Array}
   */
  parse (targets, config) {
    let parsed = [];

    // Lazy eval loop to allow dynamically adding targets while splitting
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];

      // Deprecate old format
      if ('js' in target || 'css' in target || 'html' in target) {
        warn('this config format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help');
        return parsed;
      }

      if (target.modular == null) target.modular = true;
      if (target.label == null) target.label = '';
      target.isRoot = !target.input;
      this.parseInput(target, config.runtimeOptions);
      // Ignore targets with nulled input (no grep match)
      if (!('input' in target) || target.input != null) {
        this.parseOutput(target, config.runtimeOptions);
        if (this.validateInputOutput(target)) {
          this.parseSources(target, config);
          this.parseAppServer(target, config);
          // Store hooks
          if (target.before) target.before = this.defineHook(target.before);
          if (target.afterEach) target.afterEach = this.defineHook(target.afterEach);
          if (target.after) target.after = this.defineHook(target.after);
          // Deprecate aliases
          if (target.alias) warn(strong('alias') + ' attribute is no longer supported. Use package.json ' + strong('browser') + ' field instead', 1);
          // Traverse child targets
          if (target.targets) {
            target.hasChildren = true;
            target.targets = this.parse(target.targets, config).map((tgt) => {
              tgt.hasParent = !target.isRoot;
              return tgt;
            });
          }
          parsed.push(target);

        // Split into multiple targets
        } else {
          for (let j = 0; j < target.input.length; j++) {
            const tgt = clone(target);

            tgt.input = target.input[j];
            tgt.output = target.output[j];
            tgt.inputpath = tgt.outputpath = '';
            targets.push(tgt);
          }
        }
      }
    }

    return parsed;
  },

  /**
   * Process default workflows
   * @param {Object} config
   */
  processWorkflows (config) {
    config.workflows = {};

    // CSS
    config.workflows.css = [['load'], [], []];
    if (config.runtimeOptions.lint) config.workflows.css[0].push('lint');
    config.workflows.css[0].push('parse');
    config.workflows.css[2].push('output:inline', 'output:compile');
    if (config.runtimeOptions.compress) config.workflows.css[2].push('output:compress');

    // HTML
    config.workflows.html = [
      ['load', 'parse', 'output:replaceReferences', 'output:compress'],
      [],
      ['output:compile', 'output:inline']
    ];

    // JS
    config.workflows.js = [['load'], [], []];
    if (config.runtimeOptions.lint) config.workflows.js[0].push('lint');
    // Allow for dead code removal by replacing env first
    config.workflows.js[0].push('output:replaceEnvironment', 'output:compile', 'parse');
    config.workflows.js[0].push('modular:output:replaceReferences');
    if (config.runtimeOptions.lazy) {
      if (config.runtimeOptions.compress) config.workflows.js[0].push('modular:output:compress');
      config.workflows.js[0].push('modular:output:escape');
    }
    config.workflows.js[0].push('modular:output:wrap');
    config.workflows.js[1].push('output:inline');
    config.workflows.js[2].push('modular:output:concat');
    if (config.runtimeOptions.compress) config.workflows.js[2].push('modular:output:compress');

    // IMAGE
    config.workflows.image = [['load'], [], []];
    if (config.runtimeOptions.compress) config.workflows.image[2].push('output:compress');

    // Unknown
    config.workflows.unknown = [['load'], [], []];
  },

  /**
   * Parse input path(s) for 'target'
   * @param {Object} target
   * @param {Object} runtimeOptions
   */
  parseInput (target, runtimeOptions) {
    if (target.input) {
      if (!Array.isArray(target.input)) target.input = [target.input];

      target.input = flatten(target.input.map((input) => {
        // Expand glob pattern
        if (RE_GLOB.test(input)) {
          input = glob(input, { matchBase: true });
        }
        return input;
      })).filter((input) => {
        let include = true;

        // Include/exclude if grepping
        if (runtimeOptions.grep) {
          include = (target.label == runtimeOptions.grep)
            || match(input, runtimeOptions.grep, { matchBase: true });
          if (runtimeOptions.invert) include = !include;
        }
        return include;
      });

      target.inputpath = target.input.map((input) => {
        const inputpath = path.resolve(input);

        if (!fs.existsSync(inputpath)) warn(strong(input) + ' doesn\'t exist', 1);
        return inputpath;
      });

      if (!target.input.length) {
        target.input = null;
        target.inputpath = null;
      } else if (target.input.length == 1) {
        target.input = target.input[0];
        target.inputpath = target.inputpath[0];
      }
    }
  },

  /**
   * Parse output path(s) for 'target'
   * @param {Object} target
   * @param {Object} runtimeOptions
   */
  parseOutput (target, runtimeOptions) {
    if (target.output) {
      target.output_compressed = target.output_compressed || [''];
      if (!Array.isArray(target.output)) target.output = [target.output];
      if (!Array.isArray(target.output_compressed)) target.output_compressed = [target.output_compressed];

      target.outputpath = target.output.map((output, idx) => {
        return (runtimeOptions.compress && target.output_compressed[idx])
          ? path.resolve(target.output_compressed[idx])
          : path.resolve(output);
      });

      if (target.output.length == 1) {
        target.output = target.output[0];
        target.outputpath = target.outputpath[0];
      }
    }
  },

  /**
   * Validate input/output path(s) for 'target'
   * @param {Object} target
   * @returns {Boolean}
   */
  validateInputOutput (target) {
    if (target.input) {
      const isInputArray = Array.isArray(target.input)
        , isInputFile = !isInputArray && path.extname(target.inputpath).length;

      target.batch = !isInputFile;

      if (target.output) {
        const isOutputArray = Array.isArray(target.output)
          , isOutputFile = !isOutputArray && path.extname(target.outputpath).length;

        // Validate input/output combination
        if (isInputArray && isOutputArray) {
          // Trigger split into multiple targets
          if (target.input.length == target.output.length) return false;

          throw new Error('total number of inputs ('
            + strong(target.input)
            + ') do not match total number of outputs ('
            + strong(target.output)
            + ')');

        } else if (!isInputArray && isOutputArray || !isInputFile && isOutputFile) {
          throw new Error('unable to resolve inputs ('
            + strong(target.input)
            + ') with outputs ('
            + strong(target.output)
            + ')');
        } else if (isInputArray && !isOutputArray) {
          // Multiple => single
          target.concat = isOutputFile;
          // Multiple => dir
          target.batch = !isOutputFile;
        }
      }
    }

    return true;
  },

  /**
   * Parse sources for 'target'
   * @param {Object} target
   * @param {Object} config
   */
  parseSources (target, config) {
    config.sources = (target.sources || [])
      .concat(config.sources)
      .map((source) => {
        return path.resolve(source);
      });
    target.sources = config.sources;
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
      target.appServer = contains(target.inputpath, path.resolve(config.server.file));
    }
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
        throw new Error('hook ('
          + strong(hook)
          + ') isn\'t a valid path');
      }
    }

    return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
  }
};