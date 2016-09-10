'use strict';

const { error, strong } = require('./utils/cnsl');
const { hunt: { sync: hunt } } = require('recur-fs');
const { print } = require('./utils/cnsl');
const buildParser = require('./utils/buildParser');
const env = require('./utils/env');
const File = require('./File');
const fs = require('fs');
const merge = require('lodash/merge');
const path = require('path');
const pluginLoader = require('./utils/pluginLoader');

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
   * @param {String|Object} [configpath]
   * Constructor
   * @param {Object} [runtimeOptions]
   */
  constructor (configpath, runtimeOptions) {
    const version = require(path.resolve(__dirname, '../package.json')).version;

    env('VERSION', version);

    this.build = [];
    this.buildTargetVersionByType = {};
    this.fileExtensions = [];
    this.fileExtensionsByType = {};
    this.fileDefinitionByExtension = {};
    this.plugins = {};
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
    this.url = '';
    this.version = version;

    let data;

    if ('string' == typeof configpath || configpath == null) {
      this.url = locateConfig(configpath);
      data = require(this.url);

      // Set current directory to location of file
      process.chdir(path.dirname(this.url));
      print('loaded config ' + strong(this.url), 0);

    // Passed in JSON object
    } else {
      data = configpath;
    }

    // Package.json
    if (data.buddy) data = data.buddy;
    // Handle super simple mode
    if (data.input) data = { build: [data] };
    // Merge config file data
    merge(this, data);

    // Load default/installed plugins
    // Generates fileExtensions/types used to validate build
    pluginLoader.loadPluginModules(this);
    // Parse build data
    buildParser.parse(this);
  }

  /**
   * Register file 'extensions' for 'type'
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileExtensionsForType (extensions, type) {
    if (!this.fileExtensionsByType[type]) this.fileExtensionsByType[type] = [];
    this.fileExtensionsByType[type].push(...extensions);
    this.fileExtensions.push(...extensions);
  }

  /**
   * Register target 'version' for 'type'
   * @param {String} version
   * @param {Object} options
   * @param {String} type
   */
  registerTargetVersionForType (version, options, type) {
    if (!this.buildTargetVersionByType[type]) this.buildTargetVersionByType[type] = {};
    this.buildTargetVersionByType[type][version] = options;
  }

  /**
   * Register file definitiion and 'extensions' for 'type'
   * @param {Function} define
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileDefinitionAndExtensionsForType (define, extensions, type) {
    const def = define(this.fileDefinitionByExtension[type] || File);

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
    const key = extensions ? extensions[0] : type;
    const def = this.fileDefinitionByExtension[key];

    if (!def) return error(`no File type available for extension for ${strong(key)}`);

    extend(def.prototype);
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