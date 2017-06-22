'use strict';

const { isArray, isNullOrUndefined, isPlainObject, isString } = require('../utils/is');
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
  ['babel-runtime', { helpers: true, polyfill: false, regenerator: false, moduleName: 'babel-runtime' }],
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true, noInterop: true, strictMode: false }]
];
const DEFAULT_BABEL_ENV_OPTIONS = {
  modules: false,
  exclude: ['transform-regenerator'],
  loose: true,
  targets: {}
};
const POSTCSS_PLUGINS_COMPRESS = ['cssnano'];
const POSTCSS_PLUGINS_DEFAULT = [];
const RE_BROWSERLIST = /android|blackberry|bb|chrome|chromeandroid|and_chr|edge|electron|explorer|ie|explorermobile|ie_mob|firefox|ff|firefoxandroid|and_ff|ios|ios_saf|opera|operamini|op_mini|operamobile|op_mob|qqandroid|and_qq|safari|baidu|samsung|ucandroid|and_uc|last|\d%/i;
const RE_ES_TARGET = /^es/i;
const RE_NODE_TARGET = /^node|^server/i;

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
    options = merge(
      {
        buddy: { plugins: [] },
        babel: { presets: [], plugins: BABEL_PLUGINS_DEFAULT.slice() },
        postcss: { plugins: POSTCSS_PLUGINS_DEFAULT.slice() }
      },
      options
    );

    const targetEnvs = parseTargetEnvs(version);

    if (type !== 'js') {
      let autoprefixerOptions = {};

      // Convert 'cssnano' options to postcss plugin
      if ('cssnano' in options) {
        options.postcss.plugins.push(['cssnano', options.cssnano]);
        delete options.cssnano;
      }
      // Convert 'autoprefixer' options to postcss plugin
      if ('autoprefixer' in options) {
        autoprefixerOptions = options.autoprefixer;
        delete options.autoprefixer;
      }

      if (Array.isArray(version)) {
        autoprefixerOptions.browsers = version;
      } else if ('browsers' in version) {
        autoprefixerOptions.browsers = version.browsers;
      }
    }
    if (type !== 'css') {
      let babelEnv = options.babel.presets.find(preset => preset[0] === 'env' || preset[0] === 'babel-env');

      if (isNullOrUndefined(babelEnv)) {
        babelEnv = ['babel-env', {}];
        options.babel.presets.push(babelEnv);
      } else {
        babelEnv[0] = 'babel-env';
      }

      babelEnv[1] = Object.assign({}, DEFAULT_BABEL_ENV_OPTIONS, { targets: targetEnvs });
    }

    return options;
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
    } else if (!isArray(version)) {
      version = [version];
    }

    return !version.some(preset => RE_NODE_TARGET.test(preset));
  }
};

/**
 * Parse env targets from 'version'
 * @param {String|Array|Object} version
 * @returns {Object}
 */
function parseTargetEnvs(version) {
  const targets = { browsers: [] };

  if (isString(version)) {
    version = [version];
  }
  if (isArray(version)) {
    version = version.reduce((version, key) => {
      version[key] = 1;
      return version;
    }, {});
  }

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
    }
  }

  return targets;
}

function parseBuddyPlugins(version) {}
