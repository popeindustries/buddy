'use strict';

const { filepathType } = require('../utils/filepath');
const { isBrowserEnvironment, loadBuildPlugins } = require('./pluginLoader');
const { indir, readdir: { sync: readdir } } = require('recur-fs');
const { strong, warn } = require('../utils/cnsl');
const buildFactory = require('../build');
const cache = require('../cache');
const fs = require('fs');
const glob = require('glob').sync;
const match = require('minimatch');
const path = require('path');

const DEPRECATED_VERSION = 'this build format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help';
const MIXED_TYPE = 'mixed';
const RE_GLOB = /[\*\[\{]/;

let numBuilds;

/**
 * Parse and validate "build" section of 'config'
 * @param {Object} config
 */
module.exports = function buildParser (config) {
  if (!config.builds) throw Error('missing build data');
  config.builds = parseBuild(
    config.builds,
    config.fileExtensions,
    config.fileFactory,
    config.npmModulepaths,
    config.runtimeOptions,
    config.server
  );
};

/**
 * Parse and validate build targets
 * @param {Array} builds
 * @param {Object} fileExtensions
 * @param {Function} fileFactory
 * @param {Array} npmModulepaths
 * @param {Object} runtimeOptions
 * @param {Object} server
 * @param {Object} [parentBuild]
 * @param {Object} [level]
 * @returns {Array}
 */
function parseBuild (builds, fileExtensions, fileFactory, npmModulepaths, runtimeOptions, server, parentBuild, level) {
  if (!parentBuild) {
    numBuilds = 0;
    level = 0;
  }

  // Deprecate sources
  if ('sources' in builds) {
    warn(`${strong('sources')} attribute is no longer supported. Use environment variable ${strong('NODE_PATH')} instead`, 1);
  }
  // Deprecate targets
  if ('targets' in builds) {
    warn(DEPRECATED_VERSION);
    builds = builds.targets;
  }

  // Support basic mode with single build target
  if (!Array.isArray(builds)) builds = [builds];

  return builds.reduce((builds, buildConfig) => {
    // Deprecate old formats
    if ('js' in buildConfig || 'css' in buildConfig || 'html' in buildConfig || 'targets' in buildConfig) {
      warn(DEPRECATED_VERSION);
      return builds;
    }
    // Deprecate aliases
    if (buildConfig.alias) warn(`${strong('alias')} attribute is no longer supported. Use package.json ${strong('browser')} field instead`, 1);
    // Deprecate modular
    if ('modular' in buildConfig) warn(`${strong('modular')} attribute has been renamed to ${strong('bundle')}`, 1);
    // Deprecate sources
    if (buildConfig.sources) warn(`${strong('sources')} attribute is no longer supported. Use environment variable ${strong('NODE_PATH')} instead`, 1);

    if (buildConfig.bootstrap == null) buildConfig.bootstrap = true;
    if (buildConfig.label == null) buildConfig.label = '';
    if (buildConfig.bundle == null || buildConfig.modular) buildConfig.bundle = true;
    buildConfig.hasChildren = false;
    buildConfig.hasParent = !!parentBuild;
    buildConfig.index = ++numBuilds;
    buildConfig.level = level;
    buildConfig.runtimeOptions = runtimeOptions;
    buildConfig.watchOnly = !buildConfig.output;

    parseInputOutput(buildConfig, fileExtensions, runtimeOptions);

    if (!buildConfig.hasParent) {
      buildConfig.browser = isBrowserEnvironment(buildConfig.version);
      buildConfig.fileCache = cache.createFileCache(runtimeOptions.watch);
    } else {
      buildConfig.browser = parentBuild.browser;
      buildConfig.fileCache = parentBuild.fileCache;
    }

    buildConfig.fileFactory = getFileFactory(buildConfig, parentBuild, {
      buildFactory: getBuildFactory(buildConfig),
      fileCache: buildConfig.fileCache,
      fileExtensions,
      fileFactory,
      pluginOptions: {},
      npmModulepaths,
      runtimeOptions
    });

    // Ignore build targets with nulled input (no grep match)
    if ('input' in buildConfig && buildConfig.input != null) {
      // Flag as app server target
      buildConfig.isAppServer = isAppServer(buildConfig.inputpaths, server);

      // Traverse child build targets
      if (buildConfig.build) {
        buildConfig.hasChildren = true;
        buildConfig.builds = parseBuild(buildConfig.build, fileExtensions, fileFactory, npmModulepaths, runtimeOptions, server, buildConfig, level + 1);
        parseChildInputpaths(buildConfig);
        delete buildConfig.build;
      }
      builds.push(buildFactory(buildConfig));
    }

    delete buildConfig.options;
    delete buildConfig.version;

    return builds;
  }, []);
}

/**
 * Retrieve file factory for 'buildConfig'
 * @param {Object} buildConfig
 * @param {Object} parentBuild
 * @param {Object} fileFactoryOptions
 * @returns {Function}
 */
function getFileFactory (buildConfig, parentBuild, fileFactoryOptions) {
  const { fileFactory } = fileFactoryOptions;
  const needsPlugins = 'input' in buildConfig && buildConfig.input != null && !buildConfig.watchOnly;
  const hasPlugins = parentBuild ? !!(buildConfig.options || buildConfig.version) : true;

  // Use parentBuild's unless has own plugins
  if (parentBuild && !hasPlugins) return parentBuild.fileFactory;

  // Only load plugins for active output builds
  if (needsPlugins) {
    fileFactoryOptions.pluginOptions = loadBuildPlugins(buildConfig.type, buildConfig.options, buildConfig.version);
  }

  // Overwrite fileFactory function with memoized options
  fileFactoryOptions.fileFactory = function createFile (filepath) {
    return fileFactory(filepath, fileFactoryOptions);
  };

  return fileFactoryOptions.fileFactory;
}

/**
 * Retrieve build factory for 'buildConfig'
 * @param {Object} buildConfig
 * @returns {Function}
 */
function getBuildFactory (buildConfig) {

}

/**
 * Parse input/output path(s) for 'buildConfig'
 * @param {Object} buildConfig
 * @param {Object} fileExtensions
 * @param {Object} runtimeOptions
 */
function parseInputOutput (buildConfig, fileExtensions, runtimeOptions) {
  let outputs, outputIsDirectory;

  // Parse output
  if (buildConfig.output) {
    outputs = buildConfig.output;

    if (!Array.isArray(outputs)) outputs = [outputs];

    // Use compressed if specified
    if (runtimeOptions.compress && 'output_compressed' in buildConfig) {
      let outputsCompressed = buildConfig.output_compressed;

      if (!Array.isArray(outputsCompressed)) outputsCompressed = [outputsCompressed];
      if (outputsCompressed.length != outputs.length) {
        throw Error(`total number of outputs (${strong(buildConfig.output)}) do not match total number of compressed outputs (${strong(buildConfig.output_compressed)})`);
      }
      outputs = outputsCompressed;
      buildConfig.output = buildConfig.output_compressed;
    }

    outputIsDirectory = (outputs.length == 1 && !path.extname(outputs[0]).length);
  } else {
    buildConfig.outputpaths = [];
  }

  // Parse input
  if (buildConfig.input) {
    let allFileExtensions = [];
    let inputs = buildConfig.input;
    let inputsRelative = [];
    let type = '';

    // Gather all extensions to allow for easier filtering
    for (const type in fileExtensions) {
      allFileExtensions.push(...fileExtensions[type]);
    }

    if (!Array.isArray(inputs)) inputs = [inputs];

    buildConfig.inputpaths = inputs.reduce((inputs, input) => {
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
        buildConfig.batch = true;
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
        include = (buildConfig.label == runtimeOptions.grep)
          || match(input, runtimeOptions.grep, { matchBase: true });
        if (runtimeOptions.invert) include = !include;
      }
      // Exclude unknown files
      if (!allFileExtensions.includes(extension)) {
        warn(`${strong(extension)} is an unknown file type (${strong(input)}). You should install a language pack from npm to enable support. Search npm for "buddy-plugin" to see all available.`);
        include = false;
      }

      if (!include) inputsRelative.splice(idx, 1);
      return include;
    }).map((input) => {
      const inputpath = path.resolve(input);
      const inputType = filepathType(inputpath, fileExtensions);

      type = (!type || type == inputType) ? inputType : MIXED_TYPE;

      if (!fs.existsSync(inputpath)) warn(strong(input) + ' doesn\'t exist', 1);
      return inputpath;
    });

    if (!buildConfig.inputpaths.length) {
      buildConfig.input = null;
      buildConfig.inputpaths = null;
      return;
    }

    buildConfig.type = type;

    if (outputs) {
      if (buildConfig.inputpaths.length != outputs.length && !outputIsDirectory) {
        throw Error(`unable to resolve inputs (${strong(buildConfig.input)}) with outputs (${strong(buildConfig[runtimeOptions.compress ? 'output_compressed' : 'output'])})`);
      }

      buildConfig.outputpaths = buildConfig.inputpaths.map((inputpath, idx) => {
        let outputpath = '';

        if (outputIsDirectory) {
          // Preserve relative paths when batching
          outputpath = path.join(path.resolve(outputs[0]), inputsRelative[idx]);
        } else {
          outputpath = path.resolve(outputs[idx]);
        }

        const extension = path.extname(outputpath);
        const inputType = filepathType(inputpath, fileExtensions);

        // Resolve missing extension
        if (!extension) outputpath += `.${inputType}`;
        if (inputType != 'img' && extension != `.${inputType}`) outputpath = outputpath.replace(extension, `.${inputType}`);

        return outputpath;
      });
    }
  }
}

/**
 * Parse nested child input paths
 * @param {Object} buildConfig
 */
function parseChildInputpaths (buildConfig) {
  function parse (build) {
    let inputpaths = [];

    build.forEach((buildConfig) => {
      inputpaths = inputpaths.concat(buildConfig.inputpaths, buildConfig.build ? parse(buildConfig.build) : []);
    });

    return inputpaths;
  }

  buildConfig.childInputpaths = parse(buildConfig.build);
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