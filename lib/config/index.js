'use strict';

const { error, print, strong, warn } = require('../utils/cnsl');
const { hunt: { sync: hunt } } = require('recur-fs');
const { identify, VERSION_DELIMITER } = require('../resolver');
const buildParser = require('./buildParser');
const cache = require('../cache');
const File = require('../File');
const fs = require('fs');
const merge = require('lodash/merge');
const path = require('path');
const pluginLoader = require('./pluginLoader');
const serverParser = require('./serverParser');
const utils = require('../utils');

const DEFAULT_MANIFEST = {
  js: 'buddy.js',
  json: 'buddy.json',
  pkgjson: 'package.json'
};

/**
 * Retrieve new instance of Config
 * @param {String|Object} [configpath]
 * @param {Object} [runtimeOptions]
 * @returns {Config}
 */
module.exports = function configFactory (configpath, runtimeOptions) {
  return new Config(configpath, runtimeOptions);
};

class Config {
  /**
   * Constructor
   * @param {String|Object} [configpath]
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
  constructor (configpath, runtimeOptions) {
    let data;

    if ('string' == typeof configpath || configpath == null) {
      this.url = locateConfig(configpath);
      data = require(this.url);

      // Set current directory to location of file
      process.chdir(path.dirname(this.url));
      print('loaded config ' + strong(this.url), 0);

    // Passed in JSON object
    } else {
      this.url = '';
      data = configpath;
    }
    // Package.json
    if (data.buddy) data = data.buddy;
    // Handle super simple mode
    if (data.input) data = { build: [data] };

    this.fileDefinitionByExtension = {};
    this.fileExtensions = {};
    this.npmModulepaths = parseNpmModulepaths();
    this.runtimeOptions = merge({
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
    }, runtimeOptions);
    this.script = '';
    this.server = {
      directory: '.',
      port: 8080
    };
    this.fileFactory = this.fileFactory.bind(this);

    // Force NODE_ENV
    if (this.runtimeOptions.compress) process.env.NODE_ENV = 'production';

    // Merge file data
    merge(this, data);
    this.builds = this.build || [];
    delete this.build;

    // Load default/installed plugins
    // Generates fileExtensions/types used to validate build
    pluginLoader.loadBuddyPlugins(this, parsePlugins(this));
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
   *  - {Object} fileCache
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Array} npmModulepaths
   *  - {Object} pluginOptions
   *  - {Object} resolverCache
   *  - {Object} runtimeOptions
   * @returns {File}
   */
  fileFactory (filepath, options) {
    const { browser, fileCache, fileExtensions, resolverCache } = options;

    // Retrieve cached
    if (fileCache.hasFile(filepath)) {
      const file = fileCache.getFile(filepath);

      file.options = options;
      return file;
    }

    const extension = path.extname(filepath).slice(1);
    const id = identify(filepath, { browser, cache: resolverCache, fileExtensions });
    const ctor = this.fileDefinitionByExtension[extension];

    if (!id) throw Error(`unable to create file for: ${strong(filepath)}`);

    const file = new ctor(id, filepath, options);

    fileCache.addFile(file);

    // Warn of multiple versions
    const versions = resolverCache.getFileVersions(id, VERSION_DELIMITER);

    if (versions.length > 1 && options.runtimeOptions.bundle && options.browser) {
      const [name, version] = id.split(VERSION_DELIMITER);
      const parts = name.split('/');
      // Handle scoped
      const pkg = parts.slice(0, (parts[0].charAt(0) == '@') ? 2 : 1).join('/');

      warn(`more than one version of the ${strong(pkg)} package exists (${strong(file.relpath)})`, 2);
      print(`If ${strong(pkg)} is a project dependency, consider using the same version (${strong(version)}) to reduce duplication`, 2);
    }

    return file;
  }

  /**
   * Register file 'extensions' for 'type'
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileExtensionsForType (extensions, type) {
    if (!this.fileExtensions[type]) this.fileExtensions[type] = [];
    this.fileExtensions[type].push(...extensions);
  }

  /**
   * Register target 'version' for 'type'
   * @param {String} version
   * @param {Array} plugins
   * @param {String} type
   */
  registerTargetVersionForType (version, plugins, type) {
    if (type == 'js') {
      pluginLoader.addPreset('babel', version, plugins);
    }
  }

  /**
   * Register file definitiion and 'extensions' for 'type'
   * @param {Function} define
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileDefinitionAndExtensionsForType (define, extensions, type) {
    const def = define(this.fileDefinitionByExtension[type] || File, utils);

    if (extensions) {
      this.registerFileExtensionsForType(extensions, type);
      extensions.forEach((extension) => {
        this.fileDefinitionByExtension[extension] = def;
      });
    }
  }

  /**
   * Extend file definitiion for 'extensions' or 'type'
   * @param {Function} extend
   * @param {Array} extensions
   * @param {String} type
   * @returns {null}
   */
  extendFileDefinitionForExtensionsOrType (extend, extensions, type) {
    const key = extensions
      ? extensions[0]
      : this.fileExtensions[type][0];
    const def = this.fileDefinitionByExtension[key];

    if (!def) return error(`no File type available for extension for ${strong(key)}`);

    extend(def.prototype, utils);
  }

  /**
   * Destroy instance
   */
  destroy () {
    cache.clear();
  }
}

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
function locateConfig (url) {
  let configpath = '';

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
}

/**
 * Parse plugins defined in 'config'
 * @param {Config} config
 * @returns {Array}
 */
function parsePlugins (config) {
  let plugins = [];

  function parse (plugins) {
    return plugins.map((plugin) => {
      if ('string' == typeof plugin) plugin = path.resolve(plugin);
      return plugin;
    });
  }

  // Handle plugin paths defined in config file
  if (config.plugins) {
    plugins.push(...parse(config.plugins));
    delete config.plugins;
  }
  // Handle plugin paths/functions defined in runtime options
  if (config.runtimeOptions.plugins) {
    plugins.push(...parse(config.runtimeOptions.plugins));
    delete config.runtimeOptions.plugins;
  }

  return plugins;
}

/**
 * Parse all npm package paths
 * @returns {Array}
 */
function parseNpmModulepaths () {
  const jsonpath = path.resolve('package.json');

  try {
    const json = require(jsonpath);

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