'use strict';

const { dummyFile } = require('../settings');
const { filepathType } = require('../utils/filepath');
const { indir, readdir: { sync: readdir } } = require('recur-fs');
const { isArray, isNullOrUndefined, isInvalid } = require('../utils/is');
const { strong, warn } = require('../utils/cnsl');
const buildFactory = require('../build');
const buildPlugins = require('./buildPlugins');
const cache = require('../cache');
const glob = require('glob').sync;
const match = require('minimatch');
const path = require('path');

const DEPRECATED_ALIAS = `${strong('alias')} attribute is no longer supported. Use package.json ${strong('browser')} field instead`;
const DEPRECATED_MODULAR = `${strong('modular')} attribute has been renamed to ${strong('bundle')}`;
const DEPRECATED_SOURCES = `${strong('sources')} attribute is no longer supported. Use environment variable ${strong('NODE_PATH')} instead`;
const DEPRECATED_VERSION =
  'this build format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help';
const MIXED_TYPE = 'mixed';
const RE_GENERATED_INPUT = /^children:(.+)$/;
const RE_GLOB = /[\*\[\{]/;
const RE_HIDDEN = /^\./;
const RE_TRAILING = /[\/\\]$/;

let numBuilds;

/**
 * Parse and validate "build" section of 'config'
 * @param {Object} config
 */
module.exports = function buildParser(config) {
  if (isNullOrUndefined(config.builds)) {
    throw Error('missing build data');
  }
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
 * @param {Object} serverConfig
 * @param {Object} [parent]
 * @param {Number} [level]
 * @returns {Array}
 */
function parseBuild(builds, fileExtensions, fileFactory, npmModulepaths, runtimeOptions, serverConfig, parent, level) {
  if (isNullOrUndefined(parent)) {
    numBuilds = 0;
    level = 1;
  }

  // Deprecate sources
  if ('sources' in builds) {
    warn(DEPRECATED_SOURCES, 1);
  }
  // Deprecate targets
  if ('targets' in builds) {
    warn(DEPRECATED_VERSION, 1);
    builds = builds.targets;
  }

  // Support basic mode with single build target
  if (!isArray(builds)) {
    builds = [builds];
  }

  return builds.reduce((builds, buildConfig) => {
    const { options, version } = buildConfig;
    const childBuilds = !isNullOrUndefined(buildConfig.build) ? buildConfig.build : buildConfig.children;

    buildConfig.build = null;
    buildConfig.options = null;
    buildConfig.version = null;

    // Deprecate old formats
    if ('js' in buildConfig || 'css' in buildConfig || 'html' in buildConfig || 'targets' in buildConfig) {
      warn(DEPRECATED_VERSION);
      return builds;
    }
    // Deprecate aliases
    if (buildConfig.alias) {
      warn(DEPRECATED_ALIAS, 1);
    }
    // Deprecate modular
    if ('modular' in buildConfig) {
      warn(DEPRECATED_MODULAR, 1);
    }
    // Deprecate sources
    if (buildConfig.sources) {
      warn(DEPRECATED_SOURCES, 1);
    }

    if (isNullOrUndefined(buildConfig.bootstrap)) {
      buildConfig.bootstrap = true;
    }
    if (isNullOrUndefined(buildConfig.label)) {
      buildConfig.label = '';
    }
    if (isNullOrUndefined(buildConfig.bundle) || buildConfig.modular) {
      buildConfig.bundle = true;
    }
    buildConfig.batch = false;
    buildConfig.boilerplate = true;
    buildConfig.index = ++numBuilds;
    buildConfig.level = level;
    buildConfig.parent = parent;
    buildConfig.runtimeOptions = runtimeOptions;
    buildConfig.watchOnly = !buildConfig.output;

    parseInputOutput(buildConfig, fileExtensions, runtimeOptions);
    // Ignore build targets with nulled input (no grep match)
    if (!('input' in buildConfig && !isNullOrUndefined(buildConfig.input))) {
      return builds;
    }

    const build = buildFactory(buildConfig);
    const caches = !isNullOrUndefined(parent)
      ? { fileCache: parent.fileCache, resolverCache: parent.resolverCache }
      : cache.createCaches(runtimeOptions.watch);

    build.browser = !isNullOrUndefined(parent) ? parent.browser : buildPlugins.isBrowserEnvironment(version);
    build.fileCache = caches.fileCache;
    build.resolverCache = caches.resolverCache;
    build.fileFactoryOptions = getFileFactoryOptions(build, parent, version, options, {
      fileExtensions,
      fileFactory,
      npmModulepaths,
      runtimeOptions,
      sourceroot: serverConfig.sourceroot,
      webroot: serverConfig.webroot
    });
    build.fileFactory = build.fileFactoryOptions.fileFactory;
    // Flag as app server target
    build.isAppServer = isAppServer(build.inputpaths, serverConfig);

    // Traverse child build targets
    if (!isNullOrUndefined(childBuilds)) {
      build.builds = parseBuild(
        childBuilds,
        fileExtensions,
        fileFactory,
        npmModulepaths,
        runtimeOptions,
        serverConfig,
        build,
        level + 1
      );
      parseChildInputPaths(build);
    }

    builds.push(build);

    return builds;
  }, []);
}

/**
 * Retrieve file factory options for 'build'
 * @param {Build} build
 * @param {Build} [parent]
 * @param {Object} version
 * @param {Object} options
 * @param {Object} fileFactoryOptions
 * @returns {Function}
 */
function getFileFactoryOptions(build, parent, version, options, fileFactoryOptions) {
  const { fileFactory, runtimeOptions } = fileFactoryOptions;
  const hasPlugins = !isNullOrUndefined(parent) ? !isNullOrUndefined(options) || !isNullOrUndefined(version) : true;
  const needsPlugins = 'input' in build && !isNullOrUndefined(build.input) && !build.watchOnly;

  fileFactoryOptions.browser = build.browser;
  fileFactoryOptions.buildFactory = getBuildFactory(build);
  fileFactoryOptions.bundle = build.bundle;
  fileFactoryOptions.fileCache = build.fileCache;
  fileFactoryOptions.level = build.level + 2;
  fileFactoryOptions.pluginOptions = {};
  fileFactoryOptions.resolverCache = build.resolverCache;

  // Only load plugins for active output builds
  if (needsPlugins) {
    // Use parent's if none defined
    fileFactoryOptions.pluginOptions = hasPlugins
      ? buildPlugins.load(build.type, options, version, runtimeOptions.compress)
      : parent.fileFactoryOptions.pluginOptions;
  }

  // Overwrite fileFactory function with memoized options
  fileFactoryOptions.fileFactory = function createFile(filepath) {
    return fileFactory(filepath, fileFactoryOptions);
  };

  return fileFactoryOptions;
}

/**
 * Retrieve build factory for 'build'
 * @param {Object} build
 * @returns {Function}
 */
function getBuildFactory(build) {
  return function createBuild(inputpath, outputName) {
    const input = path.relative(process.cwd(), inputpath);
    let parent = build;

    if (!parent.builds.some(build => build.input === input)) {
      const outputpath = path.join(path.dirname(parent.outputpaths[0]), outputName);
      const buildConfig = {
        batch: parent.batch,
        boilerplate: false,
        bootstrap: false,
        browser: parent.browser,
        bundle: parent.bundle,
        fileCache: parent.fileCache,
        index: ++numBuilds,
        input,
        inputpaths: [inputpath],
        isAppServer: false,
        isDynamicBuild: true,
        label: '',
        level: parent.level + 1,
        output: path.relative(process.cwd(), path.dirname(outputpath)),
        outputpaths: [outputpath],
        parent,
        resolverCache: parent.resolverCache,
        runtimeOptions: parent.runtimeOptions,
        type: parent.type,
        watchOnly: parent.watchOnly
      };
      const build = buildFactory(buildConfig);

      build.fileFactoryOptions = getFileFactoryOptions(
        build,
        parent,
        null,
        null,
        Object.assign({}, parent.fileFactoryOptions)
      );
      build.fileFactory = build.fileFactoryOptions.fileFactory;
      parent.builds.push(build);
      parent.childInputpaths.push(inputpath);
    }

    // Find root build
    while (parent.parent) {
      parent = parent.parent;
    }
    parent.processFilesOptions.importBoilerplate = true;
  };
}

/**
 * Parse input/output path(s) for 'buildConfig'
 * @param {Object} buildConfig
 * @param {Object} fileExtensions
 * @param {Object} runtimeOptions
 */
function parseInputOutput(buildConfig, fileExtensions, runtimeOptions) {
  let outputs, outputIsDirectory;

  // Parse output
  if (!isNullOrUndefined(buildConfig.output)) {
    outputs = buildConfig.output;

    if (!isArray(outputs)) {
      outputs = [outputs];
    }

    // Use compressed if specified
    if (runtimeOptions.compress && 'output_compressed' in buildConfig) {
      let outputsCompressed = buildConfig.output_compressed;

      if (!isArray(outputsCompressed)) {
        outputsCompressed = [outputsCompressed];
      }
      if (outputsCompressed.length != outputs.length) {
        throw Error(
          `total number of outputs (${strong(buildConfig.output)}) do not match total number of compressed outputs (${strong(buildConfig.output_compressed)})`
        );
      }
      outputs = outputsCompressed;
      buildConfig.output = buildConfig.output_compressed;
    }

    outputIsDirectory = outputs.length == 1 && !path.extname(outputs[0]).length;
  } else {
    buildConfig.outputpaths = [];
  }

  // Parse input
  if (!isNullOrUndefined(buildConfig.input)) {
    const allFileExtensions = [];
    const inputsRelative = [];
    let inputs = buildConfig.input;
    let type = '';
    let matchGenerated;

    // Gather all extensions to allow for easier filtering
    for (const type in fileExtensions) {
      allFileExtensions.push(...fileExtensions[type]);
    }

    if (!isArray(inputs)) {
      inputs = [inputs];
    }

    // Handle common/intersection build
    if ((matchGenerated = RE_GENERATED_INPUT.exec(inputs[0]))) {
      type = 'js';
      buildConfig.inputpaths = [dummyFile];
      buildConfig.isGeneratedBuild = true;
      buildConfig.generatedInputPattern = matchGenerated[1];
    } else {
      buildConfig.inputpaths = inputs
        .reduce((inputs, input) => {
          // Expand glob pattern
          if (RE_GLOB.test(input)) {
            inputs = inputs.concat(glob(input, { matchBase: true, nocase: true }));
          } else {
            inputs.push(input);
          }
          return inputs;
        }, [])
        .reduce((inputs, input) => {
          const hasTrailingSlash = RE_TRAILING.test(input);

          input = path.resolve(input);
          // Expand directory
          if (path.extname(input).length === 0) {
            // Batch mode will change output behaviour if dir -> dir
            buildConfig.batch = true;
            inputs = inputs.concat(
              readdir(input, (resource, stat) => {
                const isFile = stat.isFile() && !RE_HIDDEN.test(path.basename(resource));

                // Capture relative path for dir -> dir
                // Like cp command, if trailing slash, use contents
                if (isFile) {
                  inputsRelative.push(path.relative(hasTrailingSlash ? input : path.resolve(input, '..'), resource));
                }
                return isFile;
              })
            );
          } else {
            inputs.push(input);
            inputsRelative.push(path.basename(input));
          }
          return inputs;
        }, [])
        .filter((input, idx) => {
          const extension = path.extname(input).slice(1);
          let include = true;

          // Include/exclude if grepping
          if (runtimeOptions.grep) {
            include =
              buildConfig.label === runtimeOptions.grep ||
              match(input, runtimeOptions.grep, { matchBase: true, nocase: true });
            if (runtimeOptions.invert) {
              include = !include;
            }
          }

          // Exclude unknown files
          if (!allFileExtensions.includes(extension)) {
            warn(
              `${strong(extension)} is an unknown file type (${strong(input)}). You should install a language pack from npm to enable support. Search npm for "buddy-plugin" to see all available.`
            );
            include = false;
          }

          if (!include) {
            inputsRelative.splice(idx, 1);
          }
          return include;
        })
        .map(input => {
          const inputpath = path.resolve(input);
          const inputType = filepathType(inputpath, fileExtensions);

          if (isInvalid(type)) {
            type = isInvalid(inputType) ? inputType : MIXED_TYPE;
          }

          return inputpath;
        });
    }

    // Abort if no resolved
    if (buildConfig.inputpaths.length === 0) {
      buildConfig.input = null;
      buildConfig.inputpaths = null;
      return;
    }

    buildConfig.type = type;

    if (!isNullOrUndefined(outputs)) {
      if (buildConfig.inputpaths.length !== outputs.length && !outputIsDirectory) {
        throw Error(
          `unable to resolve inputs (${strong(buildConfig.input)}) with outputs (${strong(buildConfig[runtimeOptions.compress ? 'output_compressed' : 'output'])})`
        );
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
        if (isInvalid(extension)) {
          outputpath += `.${inputType}`;
        }
        if (inputType !== 'img' && extension !== `.${inputType}`) {
          outputpath = outputpath.replace(extension, `.${inputType}`);
        }

        if (outputpath === inputpath) {
          throw Error(
            `the input ${strong(buildConfig.input)} is configured to be overwritten by ${strong(buildConfig.output)}. If you're trying to build the contents of a directory, remember to add a trailing slash to ${strong(buildConfig.input)}`
          );
        }

        return outputpath;
      });
    }
  }
}

/**
 * Parse nested child input paths
 * @param {Build} build
 */
function parseChildInputPaths(build) {
  function parse(build) {
    let inputpaths = [];

    build.forEach(build => {
      inputpaths = inputpaths.concat(build.inputpaths, !isNullOrUndefined(build.builds) ? parse(build.builds) : []);
    });

    return inputpaths;
  }

  build.childInputpaths = parse(build.builds);
}

/**
 * Determine if 'inputpaths' contain server file
 * @param {Array} inputpaths
 * @param {Object} serverConfig
 * @returns {Boolean}
 */
function isAppServer(inputpaths, serverConfig) {
  // Test if 'p' is in 'dirs'
  function contains(dirs, p) {
    if (!isArray(dirs)) {
      dirs = [dirs];
    }
    return dirs.some(dir => {
      return indir(dir, p);
    });
  }

  return (
    !isNullOrUndefined(serverConfig) && !isNullOrUndefined(serverConfig.file) && contains(inputpaths, serverConfig.file)
  );
}
