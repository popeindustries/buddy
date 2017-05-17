'use strict';

const { dummyFile, versionDelimiter } = require('../settings');
const { error, print, strong } = require('../utils/cnsl');
const { exists } = require('../utils/filepath');
const { hunt: { sync: hunt } } = require('recur-fs');
const { identify } = require('../resolver');
const { isInvalid, isNullOrUndefined, isString, isUndefined } = require('../utils/is');
const buildParser = require('./buildParser');
const cache = require('../cache');
const chalk = require('chalk');
const File = require('../File');
const fs = require('fs');
const merge = require('lodash/merge');
const path = require('path');
const buddyPlugins = require('./buddyPlugins');
const buildPlugins = require('./buildPlugins');
const serverParser = require('./serverParser');
const utils = require('../utils');

const DEFAULT_MANIFEST = {
  js: 'buddy.js',
  json: 'buddy.json',
  pkgjson: 'package.json'
};
const DEFAULT_OPTIONS = {
  compress: false,
  debug: false,
  deploy: false,
  grep: false,
  invert: false,
  maps: false,
  reload: false,
  script: false,
  serve: false,
  watch: false
};

/**
 * Retrieve new instance of Config
 * @param {String|Object} [configPath]
 * @param {Object} [runtimeOptions]
 * @returns {Config}
 */
module.exports = function configFactory(configPath, runtimeOptions) {
  return new Config(configPath, runtimeOptions);
};

class Config {
  /**
   * Constructor
   * @param {String|Object} [configPath]
   * @param {Object} [runtimeOptions]
   *  - {Boolean} compress
   *  - {Boolean} debug
   *  - {Boolean} deploy
   *  - {Boolean} grep
   *  - {Boolean} invert
   *  - {Boolean} maps
   *  - {Boolean} reload
   *  - {Boolean} script
   *  - {Boolean} serve
   *  - {Boolean} watch
   */
  constructor(configPath, runtimeOptions) {
    runtimeOptions = Object.assign({}, DEFAULT_OPTIONS, runtimeOptions);

    // Force NODE_ENV
    if (runtimeOptions.deploy) {
      process.env.NODE_ENV = 'production';
    } else if (isNullOrUndefined(process.env.NODE_ENV)) {
      process.env.NODE_ENV = 'development';
    }

    const cmd = (runtimeOptions.deploy && 'deploy') || (runtimeOptions.watch && 'watch') || 'build';
    let data;

    // No config specified or filepath or named set
    if (isNullOrUndefined(configPath) || typeof configPath === 'string') {
      const env = process.env.NODE_ENV;
      const isNamed = !isNullOrUndefined(configPath) && !path.extname(configPath) && !exists(path.resolve(configPath));

      this.url = locateConfig(isNamed ? '' : configPath);
      data = normalizeData(require(this.url));

      // Handle nested config with named sets
      if (isNamed || env in data) {
        let namedData;

        if (env in data) {
          namedData = data[env];
        } else if (configPath in data) {
          namedData = data[configPath];
        }

        if (namedData) {
          if ('server' in data) namedData.server = data.server;
          if ('script' in data) namedData.script = data.script;
          data = namedData;
        }
      }

      // Set current directory to location of file
      process.chdir(path.dirname(this.url));
      print(`\n${chalk.green.inverse(' BUDDY ' + cmd + ' ')} ${chalk.grey(new Date().toLocaleTimeString())}`, 0);
      print('\nloaded config ' + strong(this.url), 0);

      // Passed in JSON object
    } else {
      this.url = '';
      data = normalizeData(configPath);
    }

    this.fileDefinitionByExtension = {};
    this.fileExtensions = {};
    this.npmModulepaths = parseNpmModulePaths();
    this.runtimeOptions = runtimeOptions;
    this.script = '';
    this.server = {
      directory: '.',
      port: 8080
    };
    this.fileFactory = this.fileFactory.bind(this);

    // Merge file data
    merge(this, data);
    this.builds = this.build || [];
    delete this.build;

    // Load default/installed plugins
    // Generates fileExtensions/types used to validate build
    buddyPlugins.load(this, parsePlugins(this));
    // Parse 'server' data parameter
    serverParser(this);
    // Parse 'builds' data parameter
    buildParser(this);
  }

  /**
   * Retrieve File instance for 'filepath'
   * @param {String} filepath
   * @param {Object} options
   *  - {Boolean} browser
   *  - {Function} buildFactory
   *  - {Boolean} bundle
   *  - {Object} fileCache
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Number} level
   *  - {Array} npmModulepaths
   *  - {Object} pluginOptions
   *  - {Object} resolverCache
   *  - {Object} runtimeOptions
   * @returns {File}
   */
  fileFactory(filepath, options) {
    const { browser, bundle, fileCache, fileExtensions, resolverCache } = options;
    let ctor, file;

    // Handle dummy file from generated build
    if (filepath === dummyFile) {
      ctor = this.fileDefinitionByExtension.js;
      file = new ctor('dummy', filepath, options);
      return file;
    }

    // Retrieve cached
    if (fileCache.hasFile(filepath)) {
      file = fileCache.getFile(filepath);
      file.options = options;
      return file;
    }

    const extension = path.extname(filepath).slice(1);
    const id = identify(filepath, { browser, cache: resolverCache, fileExtensions });

    ctor = this.fileDefinitionByExtension[extension];
    file = new ctor(id, filepath, options);
    fileCache.addFile(file);

    // Warn of multiple versions
    if (bundle && browser) {
      resolverCache.checkMultipleVersions(id, filepath, versionDelimiter, options.level);
    }

    return file;
  }

  /**
   * Register file 'extensions' for 'type'
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileExtensionsForType(extensions, type) {
    extensions = [...extensions];
    if (!this.fileExtensions[type]) {
      this.fileExtensions[type] = [];
    }
    extensions.forEach(extension => {
      if (!this.fileExtensions[type].includes(extension)) {
        this.fileExtensions[type].push(extension);
      }
    });
  }

  /**
   * Register target 'version' for 'type'
   * @param {String} version
   * @param {String} type
   * @param {Array} plugins
   */
  registerTargetVersionForType(version, type, plugins) {
    if (type === 'js') {
      buildPlugins.addPreset('babel', version, plugins);
    }
  }

  /**
   * Register file definition and 'extensions' for 'type'
   * @param {Function} define
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileDefinitionAndExtensionsForType(define, extensions, type) {
    const def = define(this.fileDefinitionByExtension[type] || File, utils);

    if (!isNullOrUndefined(extensions)) {
      extensions.forEach(extension => {
        this.fileDefinitionByExtension[extension] = def;
      });
      this.registerFileExtensionsForType(extensions, type);
    }
  }

  /**
   * Extend file definition for 'extensions' or 'type'
   * @param {Function} extend
   * @param {Array} extensions
   * @param {String} type
   * @returns {null}
   */
  extendFileDefinitionForExtensionsOrType(extend, extensions, type) {
    const key = !isNullOrUndefined(extensions) ? extensions[0] : this.fileExtensions[type][0];
    const def = this.fileDefinitionByExtension[key];

    if (isUndefined(def)) {
      return error(`no File type available for extension for ${strong(key)}`);
    }

    extend(def.prototype, utils);
  }

  /**
   * Destroy instance
   */
  destroy() {
    cache.clear();
  }
}

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
function locateConfig(url) {
  let configPath = '';

  function check(dir) {
    // Support js, json, and package.json
    const urljs = path.join(dir, DEFAULT_MANIFEST.js);
    const urljson = path.join(dir, DEFAULT_MANIFEST.json);
    const urlpkgjson = path.join(dir, DEFAULT_MANIFEST.pkgjson);
    let urlFinal;

    if (exists((urlFinal = urljs)) || exists((urlFinal = urljson)) || exists((urlFinal = urlpkgjson))) {
      return urlFinal;
    }
    return '';
  }

  if (!isNullOrUndefined(url)) {
    configPath = path.resolve(url);

    try {
      // Try default file name if passed directory
      if (!path.extname(configPath).length || fs.statSync(configPath).isDirectory()) {
        configPath = check(configPath);
        if (configPath === '') throw Error('no default found');
      }
    } catch (err) {
      throw Error(`${strong('buddy')} config not found in ${strong(path.dirname(url))}`);
    }

    // No url specified
  } else {
    try {
      // Find the first instance of a DEFAULT file based on the current working directory
      configPath = hunt(
        process.cwd(),
        (resource, stat) => {
          if (stat.isFile()) {
            const basename = path.basename(resource);

            return (
              basename === DEFAULT_MANIFEST.js ||
              basename === DEFAULT_MANIFEST.json ||
              basename === DEFAULT_MANIFEST.pkgjson
            );
          }
        },
        true
      );
    } catch (err) {
      if (isInvalid(configPath)) {
        throw Error(`${strong('buddy')} config not found`);
      }
    }
  }

  return configPath;
}

/**
 * Parse plugins defined in 'config'
 * @param {Config} config
 * @returns {Array}
 */
function parsePlugins(config) {
  const plugins = [];

  function parse(plugins) {
    return plugins.map(plugin => {
      if (isString(plugin)) {
        plugin = path.resolve(plugin);
      }
      return plugin;
    });
  }

  // Handle plugin paths defined in config file
  if (!isNullOrUndefined(config.plugins)) {
    plugins.push(...parse(config.plugins));
    config.plugins = null;
  }
  // Handle plugin paths/functions defined in runtime options
  if (!isNullOrUndefined(config.runtimeOptions.plugins)) {
    plugins.push(...parse(config.runtimeOptions.plugins));
    config.runtimeOptions.plugins = null;
  }

  return plugins;
}

/**
 * Parse all npm package paths
 * @returns {Array}
 */
function parseNpmModulePaths() {
  const jsonPath = path.resolve('package.json');

  try {
    const json = require(jsonPath);

    return ['dependencies', 'devDependencies', 'optionalDependencies'].reduce((packages, type) => {
      if (type in json) {
        for (const dependency in json[type]) {
          packages.push(path.resolve('node_modules', dependency));
        }
      }
      return packages;
    }, []);
  } catch (err) {
    return [];
  }
}

/**
 * Normalize 'data'
 * @param {Object} data
 * @returns {Object}
 */
function normalizeData(data) {
  // Package.json
  if (!isNullOrUndefined(data.buddy)) {
    data = data.buddy;
  }
  // Handle super simple mode
  if (!isNullOrUndefined(data.input)) {
    data = { build: [data] };
  }
  return data;
}
