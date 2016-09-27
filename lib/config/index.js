'use strict';

const { error, print, strong, warn } = require('../utils/cnsl');
const { hunt: { sync: hunt } } = require('recur-fs');
const { identify } = require('../identify-resource');
const buildParser = require('./buildParser');
const env = require('../utils/env');
const File = require('../File');
const fileCache = require('./fileCache');
const fileIDCache = require('../identify-resource/cache');
const filetype = require('./filetype');
const fs = require('fs');
const merge = require('lodash/merge');
const path = require('path');
const pluginLoader = require('./pluginLoader');
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
   */
  constructor (configpath, runtimeOptions) {
    const version = require(path.resolve(__dirname, '../../package.json')).version;
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

    env('VERSION', version);

    this.build = [];
    this.fileDefinitionByExtension = {};
    this.fileExtensions = {};
    this.runtimeOptions = merge({
      compress: false,
      deploy: false,
      grep: false,
      invert: false,
      reload: false,
      script: false,
      serve: false,
      watch: false,
      verbose: false
    }, runtimeOptions);
    this.script = '';
    this.server = {
      directory: '.',
      port: 8080
    };
    this.sources = parseSources(this);
    this.version = version;
    this.caches = {
      fileInstances: fileCache(this.runtimeOptions.watch),
      fileIDs: fileIDCache,
      clear: fileIDCache.clear
    };
    this.fileFactory = this.fileFactory.bind(this);

    // Merge config file data
    merge(this, data);

    // Load default/installed plugins
    // Generates fileExtensions/types used to validate build
    pluginLoader.loadPluginModules(this, parsePlugins(this));
    // Parse build data
    buildParser.parse(this);
  }

  /**
   * Retrieve File instance for 'filepath'
   * @param {String} filepath
   * @param {Object} options
   *  - {Object} caches
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Object} pluginOptions
   *  - {Object} runtimeOptions
   *  - {Array} sources
   * @returns {File}
   */
  fileFactory (filepath, options) {
    const { caches, fileExtensions, sources } = options;

    // Retrieve cached
    if (caches.fileInstances.hasFile(filepath)) return caches.fileInstances.getFile(filepath);

    const extension = path.extname(filepath).slice(1);
    const id = identify(filepath, { fileExtensions, sources, type: filetype(filepath, fileExtensions) });
    const ctor = this.fileDefinitionByExtension[extension];

    if (!id) throw Error(`unable to create file for: ${strong(filepath)}`);

    const file = new ctor(id, filepath, options);

    caches.fileInstances.addFile(file);
    // Warn of multiple versions
    if (caches.fileIDs.hasMultipleVersions(id)) {
      warn(`more than one version of ${strong(id.split('#')[0])} exists (${strong(file.relpath)})`, 3);
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
   * @param {Object} options
   * @param {String} type
   */
  registerTargetVersionForType (version, options, type) {
    if (type == 'js') {
      pluginLoader.addPreset('babel', version, options);
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
    this.caches.fileInstances.flush();
    this.caches.fileIDs.clear();
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
 * Parse sources
 * @param {Config} config
 * @returns {Array}
 */
function parseSources (config) {
  // Default to current dir
  let sources = ['.'];

  // Handle env var
  if (process.env.NODE_PATH) {
    const paths = ~process.env.NODE_PATH.indexOf(':')
      ? process.env.NODE_PATH.split(':')
      : [process.env.NODE_PATH];

    sources.push(...paths);
  }

  return sources.map((source) => path.resolve(source));
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