'use strict';

const { isArray, isNullOrUndefined, isPlainObject, isString } = require('../utils/is');
const { strong, warn } = require('../utils/cnsl');
const babelEnv = require('babel-preset-env').default;
const browserslist = require('browserslist');
const dependencies = require('./dependencies');
const merge = require('lodash/merge');
const md5 = require('md5');
const unique = require('lodash/uniq');

const BABEL_PRESET_COMPRESS = [['babel-plugin-minify-dead-code-elimination', { keepFnArgs: true, keepFnName: true }]];
const BABEL_PRESET_DEFAULT = [
  ['babel-runtime', { helpers: true, polyfill: false, regenerator: false, moduleName: 'babel-runtime' }],
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true, noInterop: true, strictMode: false }]
];
const DEFAULT_BABEL_ENV_OPTIONS = {
  modules: false,
  exclude: ['transform-regenerator'],
  loose: true
};
const POSTCSS_PRESET_COMPRESS = ['cssnano'];
const POSTCSS_PRESET_DEFAULT = [];
const RE_BROWSERLIST = /android|blackberry|bb|chrome|chromeandroid|and_chr|edge|electron|explorer|ie|explorermobile|ie_mob|firefox|ff|firefoxandroid|and_ff|ios|ios_saf|opera|operamini|op_mini|operamobile|op_mob|qqandroid|and_qq|safari|baidu|samsung|ucandroid|and_uc|last|\d%/i;
const RE_ES_PRESET = /^es/;
const RE_GENERIC_VERSION = /^(?:node|server|browser)$/;
const RE_NODE_VERSION = /^node|^server/;
const VALID_ENVS = [
  'android',
  'browsers',
  'chrome',
  'edge',
  'electron',
  'firefox',
  'ie',
  'ios',
  'node',
  'opera',
  'safari',
  'uglify'
];

const allPlugins = {
  babel: {
    compress: BABEL_PRESET_COMPRESS,
    default: BABEL_PRESET_DEFAULT,
    es5: babelEnv(null, Object.assign({ targets: {} }, DEFAULT_BABEL_ENV_OPTIONS)),
    es2015: babelEnv(null, Object.assign({ targets: { chrome: 51 } }, DEFAULT_BABEL_ENV_OPTIONS)),
    es2016: babelEnv(null, Object.assign({ targets: { chrome: 52 } }, DEFAULT_BABEL_ENV_OPTIONS))
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
    if (isNullOrUndefined(allPlugins[type])) {
      allPlugins[type] = {};
    }
    allPlugins[type][name] = preset;
  },

  parsePlugins(type = '', version = [], options = {}, compress = false) {
    options = merge({ buddy: { plugins: [] }, babel: { plugins: [] }, postcss: { plugins: [] } }, options);

    if (isString(version)) {
      version = [version];
    }
    if (isArray(version)) {
      version = version.reduce((version, key) => {
        version[key] = true;
        return version;
      }, {});
    }

    const browsers = [];

    for (const key in version) {

      if (!VALID_ENVS.includes(key)) {
        if (RE_ES_PRESET.test(key)) {

        }
      }
    }

    // Convert 'cssnano' options to postcss plugin
    if ('cssnano' in options) {
      options.postcss.plugins.push(['cssnano', options.cssnano]);
      delete options.cssnano;
    }

    return options;
  },

  loadPlugins() {},

  /**
   * Parse external plugins based on build target 'version' and 'options'
   * @param {String} [type]
   * @param {Object} [options]
   * @param {Array} [version]
   * @param {Boolean} [compress]
   * @returns {Object}
   */
  parse(type = '', options = {}, version = [], compress = false) {
    if (isString(version)) {
      version = [version];
    }
    if (isArray(version)) {
      version = version.reduce((version, key) => {
        version[key] = true;
        return version;
      }, {});
    }

    // Start with default if available
    const plugins = type in allPlugins && !isNullOrUndefined(allPlugins[type].default)
      ? allPlugins[type].default.slice()
      : [];

    for (const key in version) {
    }
  },

  /**
   * Determine if browser environment based on 'version'
   * @param {Array} version
   * @returns {Boolean}
   */
  isBrowserEnvironment(version = []) {
    if (isPlainObject(version)) {
      version = Object.keys(version);
    } else if (!isArray(version)) {
      version = [version];
    }

    return !version.some(preset => RE_NODE_VERSION.test(preset));
  }
};
