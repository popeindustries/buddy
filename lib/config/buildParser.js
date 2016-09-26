'use strict';

const { strong, warn } = require('../utils/cnsl');
const { indir, readdir: { sync: readdir } } = require('recur-fs');
const filetype = require('./filetype');
const fs = require('fs');
const glob = require('glob').sync;
const match = require('minimatch');
const path = require('path');
const pluginLoader = require('./pluginLoader');

const DEPRECATED_VERSION = 'this build format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help';
const RE_GLOB = /[\*\[\{]/;

let numBuildTargets;

module.exports = {
  /**
   * Parse and validate build targets of 'config'
   * @param {Object} config
   */
  parse (config) {
    if (!config.build) throw Error('missing build data');
    config.build = parseBuild(
      config.build,
      config.caches,
      config.fileExtensions,
      config.fileFactory,
      config.runtimeOptions,
      config.server,
      config.sources
    );
  }
};

/**
 * Parse and validate build targets
 * @param {Object} build
 * @param {Object} caches
 * @param {Object} fileExtensions
 * @param {Function} fileFactory
 * @param {Object} runtimeOptions
 * @param {Object} server
 * @param {Array} sources
 * @param {Object} [parent]
 * @returns {Array}
 */
function parseBuild (build, caches, fileExtensions, fileFactory, runtimeOptions, server, sources, parent) {
  if (!parent) numBuildTargets = 0;
  // Deprecate sources
  if ('sources' in build) {
    warn(`${strong('sources')} attribute is no longer supported. Use environment variable ${strong('BROWSER_PATH')} instead`, 1);
  }
  // Deprecate targets
  if ('targets' in build) {
    warn(DEPRECATED_VERSION);
    build = build.targets;
  }
  // Support basic mode with single build target
  if (!Array.isArray(build)) build = [build];

  return build.reduce((build, buildTarget) => {
    // Deprecate old formats
    if ('js' in buildTarget || 'css' in buildTarget || 'html' in buildTarget || 'targets' in buildTarget) {
      warn(DEPRECATED_VERSION);
      return build;
    }
    // Deprecate aliases
    if (buildTarget.alias) warn(`${strong('alias')} attribute is no longer supported. Use package.json ${strong('browser')} field instead`, 1);
    // Deprecate modular
    if (buildTarget.modular) warn(`${strong('modular')} attribute has been renamed to ${strong('bundle')}`, 1);
    // Deprecate sources
    if (buildTarget.sources) warn(`${strong('sources')} attribute is no longer supported. Use environment variable ${strong('BROWSER_PATH')} instead`, 1);

    if (buildTarget.bootstrap == null) buildTarget.bootstrap = true;
    if (buildTarget.label == null) buildTarget.label = '';
    if (buildTarget.bundle == null || buildTarget.modular) buildTarget.bundle = true;
    buildTarget.sources = sources;
    buildTarget.hasChildren = false;
    buildTarget.hasParent = !!parent;
    buildTarget.index = ++numBuildTargets;
    buildTarget.caches = caches;
    buildTarget.runtimeOptions = runtimeOptions;
    buildTarget.watchOnly = !buildTarget.output;
    if (!buildTarget.hasParent) {
      let pluginOptions = buildTarget.options || {};

      // Generate Babel options based on 'options' and target 'version'
      // Any versions that indicate server as target will return 'false'
      buildTarget.browser = pluginLoader.loadBuildPlugins(pluginOptions, buildTarget.version);

      let fileFactoryOptions = { caches, fileExtensions, pluginOptions, runtimeOptions, sources };

      // Create fileFactory function with memoized options
      fileFactoryOptions.fileFactory = function createFile (filepath) {
        return fileFactory(filepath, fileFactoryOptions);
      };

      buildTarget.fileFactory = fileFactoryOptions.fileFactory;
    } else {
      // options/version only valid for root parent build targets
      if (buildTarget.options || buildTarget.version) warn("child build targets inherit their root parent 'version' and 'options'");
      buildTarget.browser = parent.browser;
      buildTarget.fileFactory = parent.fileFactory;
      buildTarget.sources = parent.sources;
    }
    delete buildTarget.options;
    delete buildTarget.version;

    parseInputOutput(buildTarget, fileExtensions, runtimeOptions);
    // Ignore build targets with nulled input (no grep match)
    if ('input' in buildTarget && buildTarget.input != null) {
      // Flag as app server target
      buildTarget.isAppServer = isAppServer(buildTarget.inputpaths, server);
      // Prevents pruning of dependencies if non-bundle batch job
      buildTarget.writeableFilterFlag = !buildTarget.bundle && buildTarget.batch;
      // Store hooks
      if (buildTarget.before) buildTarget.before = defineHook(buildTarget.before);
      if (buildTarget.afterEach) buildTarget.afterEach = defineHook(buildTarget.afterEach);
      if (buildTarget.after) buildTarget.after = defineHook(buildTarget.after);

      // Traverse child build targets
      if (buildTarget.build) {
        buildTarget.hasChildren = true;
        buildTarget.build = parseBuild(buildTarget.build, caches, fileExtensions, fileFactory, runtimeOptions, server, sources, buildTarget);
        parseChildInputpaths(buildTarget);
      }
      build.push(buildTarget);
    }

    return build;
  }, []);
}

/**
 * Parse input/output path(s) for 'buildTarget'
 * @param {Object} buildTarget
 * @param {Object} fileExtensions
 * @param {Object} runtimeOptions
 */
function parseInputOutput (buildTarget, fileExtensions, runtimeOptions) {
  let outputs, outputIsDirectory;

  // Parse output
  if (buildTarget.output) {
    outputs = buildTarget.output;

    if (!Array.isArray(outputs)) outputs = [outputs];

    // Use compressed if specified
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

  // Parse input
  if (buildTarget.input) {
    let allFileExtensions = [];
    let inputs = buildTarget.input;
    let inputsRelative = [];

    // Gather all extensions to allow for easier filtering
    for (const type in fileExtensions) {
      allFileExtensions.push(...fileExtensions[type]);
    }

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
      const extension = path.extname(input).slice(1);
      let include = true;

      // Include/exclude if grepping
      if (runtimeOptions.grep) {
        include = (buildTarget.label == runtimeOptions.grep)
          || match(input, runtimeOptions.grep, { matchBase: true });
        if (runtimeOptions.invert) include = !include;
      }
      // Exclude unknown files
      if (!~allFileExtensions.indexOf(extension)) {
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
}

/**
 * Parse nested child input paths
 * @param {Object} buildTarget
 */
function parseChildInputpaths (buildTarget) {
  function parse (build) {
    let inputpaths = [];

    build.forEach((buildTarget) => {
      inputpaths = inputpaths.concat(buildTarget.inputpaths, buildTarget.build ? parse(buildTarget.build) : []);
    });

    return inputpaths;
  }

  buildTarget.childInputpaths = parse(buildTarget.build);
}

/**
 * Determine if 'inputpaths' contain server file
 * @param {Array} inputpaths
 * @param {Object} server
 * @returns {Boolean}
 */
function isAppServer (inputpaths, server) {
  // Test if 'p' is in 'dirs'
  function contains (dirs, p) {
    if (!Array.isArray(dirs)) dirs = [dirs];
    return dirs.some((dir) => {
      return indir(dir, p);
    });
  }

  return server != undefined
    && server.file != undefined
    && contains(inputpaths, path.resolve(server.file));
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
      throw Error('hook ('
        + strong(hook)
        + ') isn\'t a valid path');
    }
  }

  return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
}