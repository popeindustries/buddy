// @flow

'use strict';

const { isNullOrUndefined, isPlainObject, isString } = require('../utils/is');
const { strong, warn } = require('../utils/cnsl');
const babelEnv = require('babel-preset-env').default;
const browserslist = require('browserslist');
const dependencies = require('./dependencies');
const merge = require('lodash/merge');
const md5 = require('md5');
const unique = require('lodash/uniq');

const BABEL_ES_BROWSERS = {
  es5: 'ie 8',
  es2015: 'chrome 51',
  es6: 'chrome 51',
  es2016: 'chrome 52',
  es7: 'chrome 52'
};
const BABEL_PLUGINS_COMPRESS = [['babel-plugin-minify-dead-code-elimination', { keepFnArgs: true, keepFnName: true }]];
const BABEL_PLUGINS_DEFAULT = [
  [
    'babel-plugin-transform-runtime',
    { helpers: true, polyfill: false, regenerator: false, moduleName: 'babel-runtime' }
  ],
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true, noInterop: true, strictMode: false }]
];
const DEFAULT_BABEL_ENV_OPTIONS = {
  modules: false,
  exclude: ['transform-regenerator'],
  loose: true,
  targets: {}
};
const OPTIONS_WHITELIST = ['autoprefixer', 'babel', 'cssnano', 'postcss'];
const POSTCSS_PLUGINS_COMPRESS = [['cssnano', {}]];
const RE_BABEL_PREFIX = /babel-preset-|babel-plugin-/;
const RE_BUDDY_PREFIX = /buddy-plugin-/;
const RE_BROWSERLIST = /android|blackberry|bb|chrome|chromeandroid|and_chr|edge|electron|explorer|ie|explorermobile|ie_mob|firefox|ff|firefoxandroid|and_ff|ios|ios_saf|opera|operamini|op_mini|operamobile|op_mob|qqandroid|and_qq|safari|baidu|samsung|ucandroid|and_uc|last|\d%/i;
const RE_ES_TARGET = /^es/i;
const RE_NODE_TARGET = /^node|^server/i;

module.exports = {
  /**
   * Add 'preset' definition for 'type'
   */
  addPreset(type: string, name: string, preset: Array<string>) {
    if (isNullOrUndefined(allPlugins[type])) {
      allPlugins[type] = {};
    }
    allPlugins[type][name] = preset;
  },

  /**
   * Parse plugins based on 'version' and 'options'
   * @param {String} type
   * @param {String|Array|Object} version
   * @param {Object} options
   * @param {Boolean} compress
   * @returns {Object}
   */
  parsePlugins(type = '', version, options = {}, compress = false) {
    const plugins = {
      buddy: { plugins: [] },
      babel: Object.assign({ presets: [], plugins: [] }, options.babel),
      postcss: Object.assign({ plugins: [] }, options.postcss)
    };
    const normalizedVersion = normalizeVersion(version);
    const targetEnvs = parseTargetEnvs(normalizedVersion);

    if (type !== 'js') {
      // Convert 'cssnano' options to postcss plugin
      if (compress && 'cssnano' in options) {
        plugins.postcss.plugins.push(['cssnano', options.cssnano]);
      }
      // Convert 'autoprefixer' options to postcss plugin
      if ('autoprefixer' in options) {
        plugins.postcss.plugins.push(['autoprefixer', options.autoprefixer]);
      }
      // Don't configure if no version set
      if (!isNullOrUndefined(version) || plugins.postcss.plugins.length > 0) {
        mergePlugin(plugins.postcss.plugins, ['autoprefixer', { browsers: targetEnvs.browsers }]);
      }
      if (compress) {
        mergePlugin(plugins.postcss.plugins, POSTCSS_PLUGINS_COMPRESS);
      }
    }
    if (type !== 'css') {
      mergePlugin(plugins.babel.presets, [
        'babel-preset-env',
        Object.assign({}, DEFAULT_BABEL_ENV_OPTIONS, { targets: targetEnvs })
      ]);
      mergePlugin(plugins.babel.plugins, BABEL_PLUGINS_DEFAULT);
      if (compress) {
        mergePlugin(plugins.babel.plugins, BABEL_PLUGINS_COMPRESS);
      }
    }

    plugins.buddy.plugins = parseBuddyPlugins(normalizedVersion, options);

    return plugins;
  },

  loadPlugins() {},

  /**
   * Determine if browser environment based on 'version'
   * @param {Array} version
   * @returns {Boolean}
   */
  isBrowserEnvironment(version = []) {
    if (isPlainObject(version)) {
      version = Object.keys(version);
    } else if (!Array.isArray(version)) {
      version = [version];
    }

    return !version.some(preset => RE_NODE_TARGET.test(preset));
  }
};

/**
 * Merge 'plugin' into 'plugins', taking care to merge with existing
 * @param {Array} plugins
 * @param {Array} plugin
 * @returns {Array}
 */
function mergePlugin(plugins, plugin) {
  if (Array.isArray(plugin[0])) {
    plugin.forEach(p => mergePlugin(plugins, p));
    return;
  }

  const [name, options] = plugin;
  // Handle optional babel prefix
  const altName = RE_BABEL_PREFIX.test(name) ? name.slice(13) : name;
  let existing = plugins.find(plugin => {
    const pluginName = !Array.isArray(plugin) ? plugin : plugin[0];

    return pluginName === name || pluginName === altName;
  });

  if (isNullOrUndefined(existing) || !Array.isArray(existing)) {
    existing = plugin;
    plugins.push(plugin);
  } else {
    existing[0] = name;
    existing[1] = Object.assign({}, options, existing[1]);
  }

  return existing;
}

/**
 * Parse env targets from 'version'
 * @param {Object} version
 * @returns {Object}
 */
function parseTargetEnvs(version) {
  const targets = { browsers: [] };

  for (const key in version) {
    if (RE_NODE_TARGET.test(key)) {
      targets.node = version[key] === 1 || version[key];
    } else if (RE_ES_TARGET.test(key)) {
      const browser = BABEL_ES_BROWSERS[key];

      if (!isNullOrUndefined(browser)) {
        targets.browsers.push(browser);
      }
    } else if (RE_BROWSERLIST.test(key)) {
      if (version[key] === 1) {
        targets.browsers.push(key);
      } else {
        targets[key] = version[key];
      }
    } else if (key === 'browsers') {
      targets.browsers = version[key];
    }
  }

  return targets;
}

/**
 * Parse Buddy plugins from 'version' and 'options'
 * @param {Object} version
 * @param {Object} options
 * @returns {Array}
 */
function parseBuddyPlugins(version, options) {
  const plugins = [];

  for (const key in version) {
    if (!RE_NODE_TARGET.test(key) && !RE_ES_TARGET.test(key) && !RE_BROWSERLIST.test(key) && key !== 'browsers') {
      plugins.push(key);
    }
  }
  for (const key in options) {
    if (!OPTIONS_WHITELIST.includes(key)) {
      plugins.push([key, options[key]]);
    }
  }

  return plugins;
}

/**
 * Normalize 'version' into object
 * @param {String|Array|Object} version
 * @returns {Object}
 */
function normalizeVersion(version = {}) {
  if (isString(version)) {
    version = [version];
  }
  if (Array.isArray(version)) {
    version = version.reduce((version, key) => {
      version[key] = 1;
      return version;
    }, {});
  }

  return version;
}
