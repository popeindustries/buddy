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
const RE_HIDDEN = /^\./;

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
 * @param {Object} serverConfig
 * @param {Object} [parent]
 * @returns {Array}
 */
function parseBuild (builds, fileExtensions, fileFactory, npmModulepaths, runtimeOptions, serverConfig, parent) {
  if (!parent) {
    numBuilds = 0;
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
    const childBuilds = buildConfig.build;
    const options = buildConfig.options;
    const version = buildConfig.version;

    delete buildConfig.build;
    delete buildConfig.options;
    delete buildConfig.version;

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
    buildConfig.batch = false;
    buildConfig.boilerplate = true;
    buildConfig.index = ++numBuilds;
    buildConfig.level = parent ? 1 : 0;
    buildConfig.parent = parent;
    buildConfig.runtimeOptions = runtimeOptions;
    buildConfig.watchOnly = !buildConfig.output;

    parseInputOutput(buildConfig, fileExtensions, runtimeOptions);
    // Ignore build targets with nulled input (no grep match)
    if (!('input' in buildConfig && buildConfig.input != null)) return builds;

    const build = buildFactory(buildConfig);
    const caches = parent
      ? { fileCache: parent.fileCache, resolverCache: parent.resolverCache }
      : cache.createCaches(runtimeOptions.watch);

    build.browser = parent ? parent.browser : isBrowserEnvironment(version);
    build.fileCache = caches.fileCache;
    build.resolverCache = caches.resolverCache;
    build.fileFactory = getFileFactory(build, parent, version, options, {
      browser: build.browser,
      buildFactory: getBuildFactory(build),
      fileCache: build.fileCache,
      fileExtensions,
      fileFactory,
      pluginOptions: {},
      npmModulepaths,
      resolverCache: build.resolverCache,
      runtimeOptions,
      sourceroot: serverConfig.sourceroot,
      webroot: serverConfig.webroot
    });
    // Flag as app server target
    build.isAppServer = isAppServer(build.inputpaths, serverConfig);

    // Traverse child build targets
    if (childBuilds) {
      build.builds = parseBuild(childBuilds, fileExtensions, fileFactory, npmModulepaths, runtimeOptions, serverConfig, build);
      parseChildInputpaths(build);
    }

    builds.push(build);

    return builds;
  }, []);
}

/**
 * Retrieve file factory for 'build'
 * @param {Build} build
 * @param {Build} [parent]
 * @param {Object} version
 * @param {Object} options
 * @param {Object} fileFactoryOptions
 * @returns {Function}
 */
function getFileFactory (build, parent, version, options, fileFactoryOptions) {
  const { fileFactory, runtimeOptions } = fileFactoryOptions;
  const needsPlugins = 'input' in build && build.input != null && !build.watchOnly;
  const hasPlugins = parent ? !!(options || version) : true;

  // Use parent's unless has own plugins
  if (parent && !hasPlugins) return parent.fileFactory;

  // Only load plugins for active output builds
  if (needsPlugins) {
    fileFactoryOptions.pluginOptions = loadBuildPlugins(build.type, options, version, runtimeOptions.compress);
  }

  // Overwrite fileFactory function with memoized options
  fileFactoryOptions.fileFactory = function createFile (filepath) {
    return fileFactory(filepath, fileFactoryOptions);
  };

  return fileFactoryOptions.fileFactory;
}

/**
 * Retrieve build factory for 'build'
 * @param {Object} build
 * @returns {Function}
 */
function getBuildFactory (build) {
  return function createBuild (inputpath, outputname) {
    const input = path.relative(process.cwd(), inputpath);
    let parent = build;

    if (!parent.builds.some((build) => parent.input == input)) {
      const outputpath = path.join(path.dirname(parent.outputpaths[0]), outputname);
      const buildConfig = {
        batch: parent.batch,
        boilerplate: false,
        bootstrap: false,
        browser: parent.browser,
        bundle: parent.bundle,
        fileCache: parent.fileCache,
        fileFactory: parent.fileFactory,
        index: ++numBuilds,
        input,
        inputpaths: [inputpath],
        isAppServer: false,
        label: '',
        level: 1,
        output: path.relative(process.cwd(), path.dirname(outputpath)),
        outputpaths: [outputpath],
        parent,
        runtimeOptions: parent.runtimeOptions,
        type: parent.type,
        watchOnly: parent.watchOnly
      };

      parent.builds.push(buildFactory(buildConfig));
      parent.childInputpaths.push(inputpath);
    }

    // Find root build
    while (parent.parent) parent = parent.parent;
    parent.processFilesOptions.importBoilerplate = true;
  };
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
          const isFile = stat.isFile() && !RE_HIDDEN.test(path.basename(resource));

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

      if (!fs.existsSync(inputpath)) warn(`${strong(input)} doesn't exist`, 1);
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
 * @param {Build} build
 */
function parseChildInputpaths (build) {
  function parse (build) {
    let inputpaths = [];

    build.forEach((build) => {
      inputpaths = inputpaths.concat(build.inputpaths, build.builds ? parse(build.builds) : []);
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
function isAppServer (inputpaths, serverConfig) {
  // Test if 'p' is in 'dirs'
  function contains (dirs, p) {
    if (!Array.isArray(dirs)) dirs = [dirs];
    return dirs.some((dir) => {
      return indir(dir, p);
    });
  }

  return serverConfig != undefined
    && serverConfig.file != undefined
    && contains(inputpaths, serverConfig.file);
}