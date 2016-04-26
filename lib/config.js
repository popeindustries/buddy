'use strict';

const cnsl = require('./utils/cnsl')
  , filetype = require('./utils/filetype')
  , flatten = require('lodash/flatten')
  , fs = require('fs')
  , glob = require('glob').sync
  , match = require('minimatch')
  , merge = require('lodash/merge')
  , path = require('path')
  , recurFs = require('recur-fs')

  , DEFAULT_COMPILERS = {
      css: '',
      html: '',
      js: '',
      json: ''
    }
  , DEFAULT_FILE_EXTENSIONS = {
      css: ['css'],
      html: ['html'],
      image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
      js: ['js'],
      json: ['json']
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
      fileFilter: /./,
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
  , readdir = recurFs.readdir.sync
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
    this.generateFileFilter(config);
    this.resovleSources(config);

    // Config build
    if (config.build) {
      // this.parseSources(target, config);
      config.build = this.parse([config.build], config);
      // Error parseing
      if (!config.build) throw Error('invalid "build" data for ' + strong(config.url));
    } else {
      throw Error('no "build" data for ' + strong(config.url));
    }

    return config;
  },

  /**
   * Load plugins
   * @param {Object} config
   */
  loadPlugins (config) {
    const cwd = process.cwd()
      , nodeModules = path.join(cwd, 'node_modules')
      , buddy = path.resolve(__dirname, '..');

    const _loadPlugins = (dir) => {
      try {
        walk(dir, (resource, stat) => {
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
    };

    _loadPlugins(nodeModules);
    // Load from buddy dir if buddy not installed in project dir
    if (!~cwd.indexOf(buddy)) _loadPlugins(buddy);
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
                print('registered compiler plugin ' + strong(module.registration.name) + ' for .' + ext, 0);
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
            print('registered compressor plugin ' + strong(module.registration.name) + ' for ' + type, 0);
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
   * Resolve sources
   * @param {Object} config
   */
  resovleSources (config) {
    config.sources = config.sources
      .map((source) => {
        return path.resolve(source);
      });
  },

  /**
   * Parse and validate build 'targets'
   * @param {Array} targets
   * @param {Object} config
   * @returns {Array}
   */
  parse (targets, config) {
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

      this.parseInput(target, config.fileFilter, config.runtimeOptions);
      // Ignore targets with nulled input (no grep match)
      if (!('input' in target) || target.input != null) {
        this.parseOutput(target, config.fileExtensions, config.runtimeOptions);
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
          target.targets = this.parse(target.targets, config).map((childTarget) => {
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
   * Parse input path(s) for 'target'
   * @param {Object} target
   * @param {RegExp} fileFilter
   * @param {Object} runtimeOptions
   */
  parseInput (target, fileFilter, runtimeOptions) {
    if (target.input) {
      let inputs = target.input;

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
        // Expand directory
        if (!path.extname(input).length) {
          // Batch mode will change output behaviour if dir -> dir
          target.batch = true;
          target.batchRoot = path.resolve(input);
          inputs = inputs.concat(readdir(input, (resource, stat) => {
            return stat.isFile();
          }));
        } else {
          inputs.push(input);
        }
        return inputs;
      }, []).filter((input) => {
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

        return include;
      }).map((input) => {
        const inputpath = path.resolve(input);

        if (!fs.existsSync(inputpath)) warn(strong(input) + ' doesn\'t exist', 1);
        return inputpath;
      });

      if (!target.inputpaths.length) {
        target.input = null;
        target.inputpaths = null;
      }
    }
  },

  /**
   * Parse output path(s) for 'target'
   * @param {Object} target
   * @param {Object} fileExtensions
   * @param {Object} runtimeOptions
   */
  parseOutput (target, fileExtensions, runtimeOptions) {
    if (target.output) {
      const inputpaths = target.inputpaths;
      let outputs = target.output;

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

      const isDirectory = (outputs.length == 1 && !path.extname(outputs[0]).length);

      if (inputpaths.length != outputs.length && !isDirectory) {
        throw Error(`unable to resolve inputs (${strong(target.input)}) with outputs (${strong(target[runtimeOptions.compress ? 'output_compressed' : 'output'])})`);
      }

      target.outputpaths = inputpaths.map((inputpath, idx) => {
        let outputpath = '';

        if (isDirectory) {
          // Preserve relative paths when batching
          const input = target.batch
            ? path.relative(target.batchRoot, inputpath)
            : path.basename(inputpath);

          outputpath = path.join(path.resolve(outputs[0]), input);
        } else {
          outputpath = path.resolve(outputs[idx]);
        }

        const extension = path.extname(outputpath)
          , type = filetype(inputpath, fileExtensions);

        // Resolve missing extension
        if (!extension) outputpath += `.${type}`;
        if (type != 'image' && extension != `.${type}`) outputpath = outputpath.replace(extension, `.${type}`);

        return outputpath;
      });
    } else {
      target.outputpaths = [];
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