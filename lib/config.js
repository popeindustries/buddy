'use strict';

const clone = require('lodash/lang/clone')
  , cnsl = require('./utils/cnsl')
  , merge = require('lodash/object/merge')
  , flatten = require('lodash/array/flatten')
  , fs = require('fs')
  , glob = require('glob').sync
  , match = require('minimatch')
  , path = require('path')
  , recurFs = require('recur-fs')

  , DEFAULT_FILE_EXTENSIONS = {
      css: ['css'],
      html: ['html'],
      image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
      js: ['js', 'json'],
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
      fileExtensions: merge({}, DEFAULT_FILE_EXTENSIONS),
      runtimeOptions: merge({}, DEFAULT_OPTIONS),
      script: '',
      server: merge({}, DEFAULT_SERVER),
      sources: ['.'],
      url: '',
      workflows: processWorkflows(DEFAULT_OPTIONS)
    }
  , RE_GLOB = /[\*\[\{]/

  , hunt = recurFs.hunt.sync
  , indir = recurFs.indir
  , strong = cnsl.strong
  , warn = cnsl.warn;

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String | Object} [configpath]
 * @param {String} [fileExtensions]
 * @param {Object} [runtimeOptions]
 * @returns {Object}
 */
exports.load = function load (configpath, fileExtensions, runtimeOptions) {
  const config = merge({}, DEFAULT_CONFIG, {
      fileExtensions: fileExtensions,
      runtimeOptions: runtimeOptions
    });

  let data, url;

  config.runtimeOptions.version = require(path.resolve(__dirname, '../package.json')).version;
  config.workflows = processWorkflows(config.runtimeOptions);

  // Load config path
  if ('string' == typeof configpath || configpath == null) {
    url = exports.locate(configpath);
    data = require(url);
    // Set current directory to location of file
    process.chdir(path.dirname(url));
    // Store
    config.url = url;
  // Passed in JSON object
  } else {
    data = configpath;
  }

  // Package.json
  if (data.buddy) data = data.buddy;

  // Copy server settings
  merge(config.server, data.server);
  // Copy script
  if (data.script) config.script = data.script;
  // Config build
  if (data.build) {
    config.build = exports.parse([data.build], config);
    // Error parseing
    if (!config.build) throw new Error('invalid "build" data for ' + strong(url));
  } else {
    throw new Error('no "build" data for ' + strong(url));
  }

  return config;
};

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
exports.locate = function locate (url) {
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
};

/**
 * Parse and validate build 'targets'
 * @param {Array} targets
 * @param {Object} config
 * @returns {Array}
 */
exports.parse = function parse (targets, config) {
  config = merge({}, DEFAULT_CONFIG, config || {});

  let parsed = [];

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
    target.fileExtensions = config.fileExtensions;
    target.runtimeOptions = clone(config.runtimeOptions);
    target.workflows = config.workflows;
    parseInput(target, target.runtimeOptions);
    // Ignore targets with nulled input (no grep match)
    if (!('input' in target) || target.input != null) {
      parseOutput(target);
      if (validateInputOutput(target)) {
        parseSources(target, config);
        parseAppServer(target, config);
        // Store hooks
        if (target.before) target.before = defineHook(target.before);
        if (target.afterEach) target.afterEach = defineHook(target.afterEach);
        if (target.after) target.after = defineHook(target.after);
        // Deprecate aliases
        if (target.alias) warn(strong('alias') + ' attribute is no longer supported. Use package.json ' + strong('browser') + ' field instead', 1);
        // Traverse child targets
        if (target.targets) {
          target.hasChildren = true;
          target.targets = exports.parse(target.targets, config).map((tgt) => {
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
};

/**
 * Process default workflows for 'runtimeOptions'
 * @param {Object} runtimeOptions
 * @returns {Object}
 */
function processWorkflows (runtimeOptions) {
  let workflows = {};

  // CSS
  workflows.css = [['load'], [], []];
  if (runtimeOptions.lint) workflows.css[0].push('lint');
  workflows.css[0].push('parse');
  workflows.css[2].push('output:inline', 'output:compile');
  if (runtimeOptions.compress) workflows.css[2].push('output:compress');

  // HTML
  workflows.html = [
    ['load', 'parse', 'output:replaceReferences', 'output:compress'],
    [],
    ['output:compile', 'output:inline']
  ];

  // JS
  workflows.js = [['load'], [], []];
  if (runtimeOptions.lint) workflows.js[0].push('lint');
  // Allow for dead code removal by replacing env first
  workflows.js[0].push('output:replaceEnvironment', 'output:compile', 'parse');
  workflows.js[0].push('modular:output:replaceReferences');
  if (runtimeOptions.lazy) {
    if (runtimeOptions.compress) workflows.js[0].push('modular:output:compress');
    workflows.js[0].push('modular:output:escape');
  }
  workflows.js[0].push('modular:output:wrap');
  workflows.js[1].push('output:inline');
  workflows.js[2].push('modular:output:concat');
  if (runtimeOptions.compress) workflows.js[2].push('modular:output:compress');

  // IMAGE
  workflows.image = [['load'], [], []];
  if (runtimeOptions.compress) workflows.image[2].push('output:compress');

  // Unknown
  workflows.unknown = [['load'], [], []];

  return workflows;
}

/**
 * Parse input path(s) for 'target'
 * @param {Object} target
 * @param {Object} runtimeOptions
 */
function parseInput (target, runtimeOptions) {
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
}

/**
 * Parse output path(s) for 'target'
 * @param {Object} target
 */
function parseOutput (target) {
  if (target.output) {
    target.output_compressed = target.output_compressed || [''];
    if (!Array.isArray(target.output)) target.output = [target.output];
    if (!Array.isArray(target.output_compressed)) target.output_compressed = [target.output_compressed];

    target.outputpath = target.output.map((output, idx) => {
      return (target.runtimeOptions.compress && target.output_compressed[idx])
        ? path.resolve(target.output_compressed[idx])
        : path.resolve(output);
    });

    if (target.output.length == 1) {
      target.output = target.output[0];
      target.outputpath = target.outputpath[0];
    }
  }
}

/**
 * Validate input/output path(s) for 'target'
 * @param {Object} target
 * @returns {Boolean}
 */
function validateInputOutput (target) {
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
}

/**
 * Parse sources for 'target'
 * @param {Object} target
 * @param {Object} config
 */
function parseSources (target, config) {
  config.sources = (target.sources || [])
    .concat(config.sources)
    .map((source) => {
      return path.resolve(source);
    });
  target.sources = config.sources;
}

/**
 * Determine if 'target' is app server
 * @param {Object} target
 * @param {Object} config
 */
function parseAppServer (target, config) {
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
}

/**
 * Convert hook path or expression to Function
 * @param {String} hook
 * @returns {Function}
 */
function defineHook (hook) {
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