'use strict';

const { error, print, strong, warn } = require('./cnsl');
const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const unique = require('lodash/uniq');

const BABEL_PRESET_2016 = [
  'babel-plugin-syntax-trailing-function-commas',
  'babel-plugin-transform-async-to-generator'
];
const BABEL_PRESET_2015 = [
  'babel-plugin-transform-exponentiation-operator'
];
const BABEL_PRESET_ES5 = [
  'babel-plugin-transform-es5-property-mutators',
  'babel-plugin-transform-es2015-arrow-functions',
  'babel-plugin-transform-es2015-block-scoped-functions',
  'babel-plugin-transform-es2015-block-scoping',
  'babel-plugin-transform-es2015-classes',
  'babel-plugin-transform-es2015-computed-properties',
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-duplicate-keys',
  'babel-plugin-transform-es2015-for-of',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-literals',
  'babel-plugin-transform-es2015-modules-commonjs',
  'babel-plugin-transform-es2015-object-super',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-template-literals',
  // babel-plugin-transform-es2015-typeof-symbol,
  'babel-plugin-transform-es2015-unicode-regex'
  // babel-plugin-transform-regenerator
];
const BABEL_PRESET_NODE6 = ['babel-plugin-transform-es2015-modules-commonjs'];
const BABEL_PRESET_NODE4 = [
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-modules-commonjs',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-unicode-regex'
];
const BABEL_PRESET_DEFAULT = [require('babel-plugin-external-helpers')];
const RE_JS_FILE = /\.js$/;
const RE_PLUGIN = /^buddy-plugin-/;

const babelPlugins = {
  default: BABEL_PRESET_DEFAULT,
  es5: BABEL_PRESET_ES5.concat(BABEL_PRESET_2015, BABEL_PRESET_2016),
  es2015: BABEL_PRESET_2015.concat(BABEL_PRESET_2016),
  es2016: BABEL_PRESET_2016,
  node4: BABEL_PRESET_NODE4,
  node6: BABEL_PRESET_NODE6
};

// Alias
babelPlugins.es6 = babelPlugins.es2015;
babelPlugins.es7 = babelPlugins.es2016;

module.exports = {
  /**
   * Load default/global buddy plugins
   * @param {Object} config
   */
  loadPluginModules (config) {
    const cwd = process.cwd();
    const defaultModules = path.resolve(__dirname, '../plugins');
    const projectModules = path.join(cwd, 'node_modules');
    const buddyModules = path.resolve(__dirname, '../../node_modules');

    // Load default file definitions
    loadPluginModulesFromDir(defaultModules, config);
    // Load from project dir
    loadPluginModulesFromDir(projectModules, config);
    // Load from buddy dir if buddy not installed in project dir
    if (!~buddyModules.indexOf(cwd)) loadPluginModulesFromDir(buddyModules, config);
  },

  /**
   * Load external plugins
   * @param {Object} version
   * @param {Object} options
   */
  loadBuildPlugins (version, options) {
    version = version || [];
    if (!Array.isArray(version)) version = [version];
    options.babel = options.babel || {};

    // Default plugins should already be loaded (including those registerd as buddy-plugins-*)
    let plugins = [babelPlugins.default];

    options.babel.plugins = unique(version.reduce((plugins, preset) => {
      return plugins.concat(babelPlugins[preset.toLowerCase()]);
    }, []).concat(options.babel.plugins || []));

    let dependencies = [];

    for (const prop in options) {
      dependencies = dependencies.concat(extractDependencyStrings(options[prop]));
    }

    const missingDependenciesString = dependencies.filter((dependency) => {
      return !require.resolve(dependency);
    }).join(' ');

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

    plugins[1] = options.babel.plugins;
    options.babel.plugins = plugins;
  }
};

/**
 * Load plugins in 'dir'
 * @param {String} dir
 * @param {Object} config
 */
function loadPluginModulesFromDir (dir, config) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir)
    .filter((resource) => {
      if (path.basename(dir) != 'plugins') return RE_PLUGIN.test(resource);
      return RE_JS_FILE.test(resource) || fs.statSync(path.join(dir, resource)).isDirectory();
    })
    .forEach((resource) => {
      registerPluginModule(path.join(dir, resource), config);
    });
}

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @returns {null}
 */
function registerPluginModule (resource, config) {
  let module;

  try {
    module = require(resource);
  } catch (err) {
    return warn(`unable to load plugin ${strong(resource)}`);
  }

  if (!('register' in module)) return warn(`invalid plugin ${strong(resource)}`);

  module.register(config);
  print(`registered plugin ${strong(module.name)}`, 0);
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
  function resolve (items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.forEach((item, idx, items) => {
        if (Array.isArray(item)) {
          item[0] = require(item[0]);
        } else {
          items[idx] = require(item);
        }
      });
    }
  }

  if (optionsItem.plugins) resolve(optionsItem.plugins);
  if (optionsItem.presets) resolve(optionsItem.presets);
}