'use strict';

const { isArray, isNullOrUndefined, isPlainObject, isString } = require('../utils/is');
const { strong, warn } = require('../utils/cnsl');
const browserslist = require('browserslist');
const dependencies = require('./dependencies');
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
  'babel-plugin-transform-es2015-typeof-symbol',
  'babel-plugin-transform-es2015-unicode-regex'
  // babel-plugin-transform-regenerator
];
const BABEL_PRESET_COMPRESS = [['babel-plugin-minify-dead-code-elimination', { keepFnArgs: true, keepFnName: true }]];
const BABEL_PRESET_DEFAULT = [
  'babel-plugin-external-helpers',
  ['babel-plugin-transform-es2015-modules-commonjs', { loose: true, strictMode: false }]
];
const POSTCSS_PRESET_COMPRESS = ['cssnano'];
const POSTCSS_PRESET_DEFAULT = [];
const RE_NODE_VERSION = /^node|^server/;
const RE_GENERIC_VERSION = /^(?:node|server|browser)$/;
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
    es5: BABEL_PRESET_ES5.concat(BABEL_PRESET_2015, BABEL_PRESET_2016, BABEL_PRESET_2017),
    es2015: BABEL_PRESET_2015.concat(BABEL_PRESET_2016, BABEL_PRESET_2017),
    es2016: BABEL_PRESET_2016.concat(BABEL_PRESET_2017),
    es2017: BABEL_PRESET_2017
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
