'use strict';

const { error, print, strong, warn } = require('../utils/cnsl');
const { execSync: exec } = require('child_process');
const { resolve } = require('../dependency-resolver');
const fs = require('fs');
const path = require('path');

const BABEL_PRESET_2016 = [
  'babel-plugin-syntax-trailing-function-commas',
  'babel-plugin-transform-async-to-generator'
];
const BABEL_PRESET_2015 = ['babel-plugin-transform-exponentiation-operator'];
const BABEL_PRESET_ES5 = [
  'babel-plugin-transform-es5-property-mutators',
  'babel-plugin-transform-es2015-arrow-functions',
  'babel-plugin-transform-es2015-block-scoped-functions',
  'babel-plugin-transform-es2015-block-scoping',
  ['babel-plugin-transform-es2015-classes', { loose: true }],
  ['babel-plugin-transform-es2015-computed-properties', { loose: true }],
  ['babel-plugin-transform-es2015-destructuring', { loose: true }],
  'babel-plugin-transform-es2015-duplicate-keys',
  ['babel-plugin-transform-es2015-for-of', { loose: true }],
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-literals',
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true }],
  'babel-plugin-transform-es2015-object-super',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  ['babel-plugin-transform-es2015-spread', { loose: true }],
  'babel-plugin-transform-es2015-sticky-regex',
  ['babel-plugin-transform-es2015-template-literals', { loose: true }],
  // babel-plugin-transform-es2015-typeof-symbol,
  'babel-plugin-transform-es2015-unicode-regex'
  // babel-plugin-transform-regenerator
];
const BABEL_PRESET_NODE6 = [['babel-plugin-transform-es2015-modules-commonjs', { loose: true }]];
const BABEL_PRESET_NODE4 = [
  ['babel-plugin-transform-es2015-destructuring', { loose: true }],
  'babel-plugin-transform-es2015-function-name',
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true }],
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  ['babel-plugin-transform-es2015-spread', { loose: true }],
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-unicode-regex'
];
const BABEL_PRESET_DEFAULT = ['babel-plugin-external-helpers'];
// const BABEL_PRESET_DEFAULT = [];
// Require here to allow for bundling
const DEFAULT_PLUGINS = [
  require('../plugins/css'),
  require('../plugins/flow'),
  require('../plugins/html'),
  require('../plugins/img'),
  require('../plugins/js'),
  require('../plugins/json'),
  require('../plugins/react'),
  require('../plugins/uglify')
];
const POSTCSS_PRESET_DEFAULT = [];
const RE_JS_FILE = /\.js$/;
const RE_NODE_VERSION = /^node|^server/;
const RE_PLUGIN = /^buddy-plugin-/;

const babel = {
  default: BABEL_PRESET_DEFAULT,
  es5: BABEL_PRESET_ES5.concat(BABEL_PRESET_2015, BABEL_PRESET_2016),
  es2015: BABEL_PRESET_2015.concat(BABEL_PRESET_2016),
  es2016: BABEL_PRESET_2016,
  node4: BABEL_PRESET_NODE4,
  node6: BABEL_PRESET_NODE6
};
const postcss = {
  default: POSTCSS_PRESET_DEFAULT
};

// Alias
babel.es6 = babel.es2015;
babel.es7 = babel.es2016;

module.exports = {
  /**
   * Add 'preset' definition for 'type'
   * @param {String} type
   * @param {String} name
   * @param {Array} preset
   */
  addPreset (type, name, preset) {
    if (type == 'babel') {
      babel[name] = preset;
    } else if (type == 'postcss') {
      postcss[name] = preset;
    }
  },

  /**
   * Load default/global buddy plugins
   * @param {Object} config
   * @param {Array} [additionalPluginModules]
   */
  loadBuddyPlugins (config, additionalPluginModules = []) {
    const cwd = process.cwd();
    const projectModules = path.join(cwd, 'node_modules');
    const projectPluginModules = path.join(cwd, 'buddy-plugins');

    // Load default and additional modules
    DEFAULT_PLUGINS
      .concat(additionalPluginModules)
      .forEach((module) => {
        registerBuddyPlugin(module, config, true);
      });
    // Load from project node_modules dir
    loadBuddyPluginsFromDir(projectModules, config);
    // Load from project buddy-plugins dir
    if (fs.existsSync(projectPluginModules)) loadBuddyPluginsFromDir(projectPluginModules, config);
  },

  /**
   * Load external plugins based on build target 'version' and 'options'
   * @param {Object} options
   * @param {Array} version
   * @returns {Boolean}
   */
  loadBuildPlugins (options, version = []) {
    if (!Array.isArray(version)) version = [version];
    options.babel = options.babel || {};
    options.babel.plugins = options.babel.plugins || [];

    let browser = true;
    // Add Babel plugins based on version preset
    let plugins = version.reduce((plugins, preset) => {
      preset = preset.toLowerCase();
      // Flag node builds
      if (RE_NODE_VERSION.test(preset)) browser = false;
      // Ignore generic without warning
      if (preset == 'node' || preset == 'server') return plugins;
      if (!babel[preset]) {
        warn(`${strong(preset)} is not a recognised build target version. Additional versions can be installed with npm`);
        return plugins;
      }
      return plugins.concat(babel[preset]);
    }, babel.default.slice());

    options.babel.plugins.forEach((plugin) => {
      const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
      let exists = false;

      plugins.some((existingPlugin, idx) => {
        const existingPluginName = Array.isArray(existingPlugin) ? existingPlugin[0] : existingPlugin;

        // Overwrite if exists
        if (pluginName == existingPluginName) {
          plugins[idx] = plugin;
          exists = true;
        }

        return exists;
      });

      if (!exists) plugins.push(plugin);
    });
    options.babel.plugins = plugins;

    const missingDependenciesString = Object.keys(options)
      .reduce((dependencies, key) => dependencies.concat(extractDependencyStrings(options[key])), [])
      .filter((dependency) => resolveDependency(dependency) == '')
      .join(' ');

    if (missingDependenciesString) {
      try {
        print(`installing the following missing dependencies: ${strong(missingDependenciesString)}`);
        exec(`npm --save-dev --save-exact install ${missingDependenciesString}`);
      } catch (err) {
        error(err);
      }
    }

    for (const prop in options) {
      resolveDependecyStrings(options[prop]);
    }

    return browser;
  }
};

/**
 * Load plugins in 'dir'
 * @param {String} dir
 * @param {Object} config
 */
function loadBuddyPluginsFromDir (dir, config) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir)
    .filter((resource) => {
      if (path.basename(dir) != 'plugins') return RE_PLUGIN.test(resource);
      return RE_JS_FILE.test(resource) || fs.statSync(path.join(dir, resource)).isDirectory();
    })
    .forEach((resource) => {
      registerBuddyPlugin(path.join(dir, resource), config);
    });
}

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @param {Boolean} [silent]
 * @returns {null}
 */
function registerBuddyPlugin (resource, config, silent) {
  let module;

  try {
    module = ('string' == typeof resource) ? require(resource) : resource;
  } catch (err) {
    return warn(`unable to load plugin ${strong(resource)}`);
  }

  if (!('register' in module)) return warn(`invalid plugin ${strong(resource)}`);

  module.register(config);
  if (!silent) print(`registered plugin ${strong(module.name)}`, 0);
}

/**
 * Extract dependency strings from 'optionsItem'
 * @param {Object} optionsItem
 * @returns {Array}
 */
function extractDependencyStrings (optionsItem) {
  let dependencies = [];

  function extract (items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.reduce((dependencies, item) => {
        // Items can be Array with depedency as first param
        const dep = Array.isArray(item) ? item[0] : item;

        // Only gather string references, not functions/modules
        if ('string' == typeof dep) dependencies.push(dep);
        return dependencies;
      }, dependencies);
    }
  }

  if (optionsItem.plugins) extract(optionsItem.plugins);
  if (optionsItem.presets) extract(optionsItem.presets);

  return dependencies;
}

/**
 * Resolve dependency strings in 'optionsItem' to modules
 * @param {Object} optionsItem
 */
function resolveDependecyStrings (optionsItem) {
  function init (items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.forEach((item, idx, items) => {
        const isArray = Array.isArray(item);
        const id = isArray ? item[0] : item;
        const filepath = resolveDependency(id);

        if (!filepath) return warn(`unable to load plugin ${strong(id)}`);

        if (isArray) {
          item[0] = require(filepath);
        } else {
          items[idx] = require(filepath);
        }
      });
    }
  }

  if (optionsItem.plugins) init(optionsItem.plugins);
  if (optionsItem.presets) init(optionsItem.presets);
}

/**
 * Resolve 'dependency' filepath
 * @param {String} dependency
 * @returns {String}
 */
function resolveDependency (dependency) {
  let filepath = '';

  if ('string' == typeof dependency) {
    try {
      // Resolve relative to buddy package
      filepath = require.resolve(dependency);
    } catch (err) {
      // Resolve relative to project package
      filepath = resolve(path.resolve('package.json'), dependency);
    }
  }

  return filepath;
}