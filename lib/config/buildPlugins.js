'use strict';

const { strong, warn } = require('../utils/cnsl');
const babelPluginsByEnvironmentVersion = require('./babel-plugins.json');
const browserslist = require('browserslist');
const dependencies = require('./dependencies');
const isPlainObject = require('lodash/isPlainObject');
const merge = require('lodash/merge');
const md5 = require('md5');
const unique = require('lodash/uniq');

const BABEL_PRESET_2017 = [
  'babel-plugin-transform-object-rest-spread',
  'babel-plugin-transform-async-generator-functions'
];
const BABEL_PRESET_2016 = ['babel-plugin-syntax-trailing-function-commas', 'babel-plugin-transform-async-to-generator'];
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
const BABEL_PRESET_NODE6 = [];
const BABEL_PRESET_NODE4 = [
  ['babel-plugin-transform-es2015-destructuring', { loose: true }],
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  ['babel-plugin-transform-es2015-spread', { loose: true }],
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-unicode-regex'
];
const BABEL_PRESET_COMPRESS = [['babel-plugin-minify-dead-code-elimination', { keepFnArgs: true, keepFnName: true }]];
const POSTCSS_PRESET_COMPRESS = ['cssnano'];
const BABEL_PRESET_DEFAULT = [
  'babel-plugin-external-helpers',
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true, strictMode: false }]
];
const POSTCSS_PRESET_DEFAULT = [];
const RE_NODE_VERSION = /^node|^server/;
const RE_GENERIC_VERSION = /^(?:node|server|browser)$/;

const allPlugins = {
  babel: {
    compress: BABEL_PRESET_COMPRESS,
    default: BABEL_PRESET_DEFAULT,
    es5: BABEL_PRESET_ES5.concat(BABEL_PRESET_2015, BABEL_PRESET_2016, BABEL_PRESET_2017),
    es2015: BABEL_PRESET_2015.concat(BABEL_PRESET_2016, BABEL_PRESET_2017),
    es2016: BABEL_PRESET_2016.concat(BABEL_PRESET_2017),
    es2017: BABEL_PRESET_2017,
    node4: BABEL_PRESET_NODE4,
    node6: BABEL_PRESET_NODE6
  },
  postcss: {
    compress: POSTCSS_PRESET_COMPRESS,
    default: POSTCSS_PRESET_DEFAULT
  }
};

// Alias
allPlugins.babel.es6 = allPlugins.babel.es2015;
allPlugins.babel.es7 = allPlugins.babel.es2016;

module.exports = {
  /**
   * Add 'preset' definition for 'type'
   * @param {String} type
   * @param {String} name
   * @param {Array} preset
   */
  addPreset(type, name, preset) {
    if (!(type in allPlugins)) allPlugins[type] = {};
    allPlugins[type][name] = preset;
  },

  /**
   * Load external plugins based on build target 'version' and 'options'
   * @param {String} [type]
   * @param {Object} [options]
   * @param {Array} [version]
   * @param {Boolean} [compress]
   * @returns {Object}
   */
  load(type = '', options = {}, version = [], compress = false) {
    if ('string' == typeof version) version = [version];
    if (isPlainObject(version)) {
      version = Object.keys(version).map(key => {
        return { [key]: version[key] };
      });
    }
    // Convert 'cssnano' options to postcss plugin
    if ('cssnano' in options) {
      if (!('postcss' in options)) options.postcss = {};
      if (!('plugins' in options.postcss)) options.postcss.plugins = [];
      options.postcss.plugins.push(['cssnano', options.cssnano]);
      delete options.cssnano;
    }
    options = merge({ babel: { plugins: [] }, postcss: { plugins: [] } }, options);

    for (const kind in options) {
      if (kind == 'babel' || kind == 'postcss') {
        // Avoid loading plugins if not a matching or mixed type
        if (!((kind == 'babel' && type == 'css') || (kind == 'postcss' && type == 'js'))) {
          loadPluginsForType(kind, options[kind], version, compress);
          // Remove fingerprint from options to prevent passing unknown parameter to transpiler
          options[`${kind}Fingerprint`] = options[kind].fingerprint;
          delete options[kind].fingerprint;
        }
      }
    }

    return options;
  },

  /**
   * Determine if browser environment based on 'version'
   * @param {Array} version
   * @returns {Boolean}
   */
  isBrowserEnvironment(version = []) {
    if (!Array.isArray(version)) version = [version];

    return !version.some(preset => {
      if ('string' != typeof preset) preset = Object.keys(preset)[0];
      return RE_NODE_VERSION.test(preset);
    });
  }
};

/**
 * Load plugins for 'type'
 * @param {String} type
 * @param {Object} options
 * @param {Array} version
 * @param {Boolean} compress
 */
function loadPluginsForType(type, options, version, compress) {
  // Start with default if available
  let plugins = type in allPlugins && allPlugins[type].default ? allPlugins[type].default.slice() : [];

  // Add plugins based on version presets
  plugins = version.reduce(
    (plugins, preset) => {
      let presetPlugins;

      if ('string' == typeof preset) {
        preset = preset.toLowerCase();
        // Ignore generic
        if (RE_GENERIC_VERSION.test(preset)) return plugins;
        // Skip if babel version and type is postcss
        if (type == 'postcss' && preset in allPlugins.babel) return plugins;

        presetPlugins = allPlugins[type][preset];
        // Try and parse with browserslist if no match
        if (!presetPlugins) preset = { browsers: [preset] };
      }

      // Handle object ({ chrome: 5 }, { browsers: ['last 3'] })
      if (!presetPlugins && 'string' != typeof preset) {
        const key = Object.keys(preset)[0];
        const value = preset[key];

        if (key == 'browsers' && Array.isArray(value)) {
          if (type == 'postcss') {
            // Add Autoprefixer and pass-through
            presetPlugins = [['autoprefixer', preset]];
          } else if (type == 'babel') {
            try {
              // Add Babel plugins based on Autoprefixer-style config
              presetPlugins = resolvePluginsForBrowsers(
                browserslist(value).map(browser => {
                  const [name, version] = browser.split(' ');

                  return { [name]: version };
                })
              );
            } catch (err) {
              /* invalid browserslist value */
            }
          }
        } else {
          // See if concated key+value exists already
          presetPlugins = allPlugins[type][(key + value).toLowerCase()] ||
            (type == 'babel' && resolvePluginsForBrowsers(preset));
        }
      }

      if (!presetPlugins) warn(`unable to resolve plugins for ${strong(preset)} version`, 1);

      return unique(plugins.concat(presetPlugins || []));
    },
    plugins
  );

  // Add compression plugins
  if (compress && type in allPlugins && allPlugins[type].compress) {
    plugins.push(...allPlugins[type].compress);
  }

  // Add plugins defined in build
  options.plugins.forEach(plugin => {
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
  options.plugins = plugins;
  // Store hash of plugin names
  options.fingerprint = md5(JSON.stringify(options));
  // Install missing dependencies
  dependencies.install(extractDependencyIds(options));
  resolveDependencyPaths(options);
}

/**
 * Extract dependency ids from 'options'
 * @param {Object} options
 * @returns {Array}
 */
function extractDependencyIds(options) {
  const dependencies = [];

  function extract(items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.reduce(
        (dependencies, item) => {
          // Items can be Array with depedency as first param
          const dep = Array.isArray(item) ? item[0] : item;

          // Only gather string references, not functions/modules
          if ('string' == typeof dep) dependencies.push(dep);
          return dependencies;
        },
        dependencies
      );
    }
  }

  if (options.plugins) extract(options.plugins);
  if (options.presets) extract(options.presets);

  return dependencies;
}

/**
 * Resolve dependency paths in 'options' to modules
 * @param {Object} options
 */
function resolveDependencyPaths(options) {
  function init(items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.forEach((item, idx, items) => {
        const isArray = Array.isArray(item);
        const id = isArray ? item[0] : item;

        // Ignore already resolved
        if ('string' == typeof id) {
          const filepath = dependencies.find(id);

          if (!filepath) return warn(`unable to load plugin ${strong(id)}`, 1);

          if (isArray) {
            item[0] = require(filepath);
          } else {
            items[idx] = require(filepath);
          }
        }
      });
    }
  }

  if (options.plugins) init(options.plugins);
  if (options.presets) init(options.presets);
}

/**
 * Resolve Babel plugins for all 'browsers'
 * @param {Array} browsers
 * @returns {Array}
 */
function resolvePluginsForBrowsers(browsers) {
  const plugins = [];

  if (!Array.isArray(browsers)) browsers = [browsers];

  browsers.forEach(browser => {
    const name = Object.keys(browser)[0];
    const version = browser[name];

    for (const pluginName in babelPluginsByEnvironmentVersion) {
      if (
        !babelPluginsByEnvironmentVersion[pluginName][name] ||
        babelPluginsByEnvironmentVersion[pluginName][name] > version
      ) {
        plugins.push(`babel-plugin-${pluginName}`);
      }
    }
  });

  return plugins;
}
