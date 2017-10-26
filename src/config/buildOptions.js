// @flow

'use strict';

type BuildOptions = {
  babel: {
    presets: Array<string | [string, {}]>,
    plugins: Array<string | [string, {}]>
  },
  postcss: {
    plugins: Array<string | [string, {}]>
  }
};
type Version =
  | { browsers: Array<string>, buddy: Array<string> }
  | { node: number | string | true, buddy: Array<string> };

const { isNullOrUndefined, isNumber, isObject, isString } = require('../utils/is');
const { strong, warn } = require('../utils/cnsl');
const babelEnv = require('babel-preset-env').default;
const browserslist = require('browserslist');
const dependencies = require('./dependencies');
const merge = require('lodash/merge');
const md5 = require('md5');
const unique = require('lodash/uniq');

const ES_TO_BROWSERS = {
  es5: 'ie 8',
  es2015: 'chrome 51',
  es6: 'chrome 51',
  es2016: 'chrome 52',
  es7: 'chrome 52',
  es2017: 'chrome 55',
  es8: 'chrome 55'
};
const ES_TO_NODE = {
  es5: '4',
  es2015: '6.5',
  es6: '6.5',
  es2016: '7',
  es7: '7',
  es2017: '7.6',
  es8: '7.6'
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
const RE_BROWSERSLIST_QUERY = /last|unreleased|not|extends|%|>=?|<=?/i;
const RE_BUDDY_PREFIX = /buddy-plugin-/;
const RE_ES_TARGET = /^es/i;
const RE_NODE_TARGET = /^node|^server/i;
const VALID_BROWSERS = [...Object.keys(browserslist.data), ...Object.keys(browserslist.aliases)];

module.exports = {
  isBrowserEnvironment,
  parseVersion,

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
   */
  parse(
    type: string = '',
    version: string | Array<string> | { [string]: number | string | true, browsers?: Array<string> },
    options: Object = {},
    compress: boolean = false
  ): BuildOptions {
    const parsedVersion = parseVersion(version);

    const plugins = {
      babel: Object.assign({ presets: [], plugins: [] }, options.babel),
      postcss: Object.assign({ plugins: [] }, options.postcss)
    };

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

    return plugins;
  },

  loadPlugins() {}
};

/**
 * Determine if browser environment based on 'version'
 */
function isBrowserEnvironment(
  version: ?string | Array<string> | { [string]: number | string | true | Array<string> } = []
): boolean {
  if (isNullOrUndefined(version)) {
    return true;
  }

  if (typeof version === 'string') {
    version = [version];
  } else if (isObject(version)) {
    version = Object.keys(version);
  }

  return !version.some(key => RE_NODE_TARGET.test(key));
}

/**
 * Parse env targets from 'version'
 *
 * 'server'                              => { node: true }
 * 'node'                                => { node: true }
 * 'react'                               => { buddy: ['react'] }
 * 'es6'                                 => { browsers: ['chrome 51'] }
 * '> 5%'                                => { browsers: ['> 5%'] }
 * ['node']                              => { node: true }
 * ['es6', 'node']                       => { node: '6.5' }
 * ['es6', 'react']                      => { browsers: ['chrome 51'], buddy: ['react'] }
 * ['> 5%', 'not ie 10']                 => { browsers: ['> 5%', 'not ie 10'] }
 * { node: true }                        => { node: true }
 * { react: true }                       => { buddy: ['react'] }
 * { react: true, chrome: 51 }           => { browsers: ['chrome 51'], buddy: ['react'] }
 * { chrome: 51 }                        => { browsers: ['chrome 51'] }
 * { chrome: '51' }                      => { browsers: ['chrome 51'] }
 * { browsers: ['> 5%', 'not ie 10'] }   => { browsers: ['> 5%', 'not ie 10'] }
 */
function parseVersion(
  version: string | Array<string> | { [string]: number | string | true, browsers?: Array<string> }
): Version {
  version = normaliseVersion(version);

  const keys = Object.keys(version);
  const isNode = keys.some(key => RE_NODE_TARGET.test(key));

  if (isNode) {
    const parsed = { node: true, buddy: [] };

    keys.forEach(key => {
      if (RE_ES_TARGET.test(key)) {
        parsed.node = ES_TO_NODE[key] || true;
      } else if (RE_NODE_TARGET.test(key)) {
        const value = version[key];

        parsed.node = isString(value) || isNumber(value) ? `${value}` : value;
      } else if (!VALID_BROWSERS.includes(key) && !RE_BROWSERSLIST_QUERY.test(key)) {
        parsed.buddy.push(key.toLowerCase());
      }
    });

    return parsed;
  }

  const parsed = { browsers: [], buddy: [] };

  keys.forEach(key => {
    if (key === 'browsers') {
      parsed.browsers.push(...version[key]);
    } else if (RE_ES_TARGET.test(key)) {
      parsed.browsers.push(ES_TO_BROWSERS[key]);
    } else if (VALID_BROWSERS.includes(key)) {
      parsed.browsers.push(`${key} ${version[key]}`);
    } else if (RE_BROWSERSLIST_QUERY.test(key)) {
      parsed.browsers.push(key);
    } else {
      parsed.buddy.push(key.toLowerCase());
    }
  });

  return parsed;
}

/**
 * Normalise 'version' into object
 */
function normaliseVersion(
  version: string | Array<string> | { [string]: number | string | true, browsers?: Array<string> } = {}
): { [string]: number | string | true, browsers?: Array<string> } {
  if (isString(version)) {
    version = [version];
  }
  if (Array.isArray(version)) {
    version = version.reduce((version, key) => {
      version[key] = true;
      return version;
    }, {});
  }

  return version;
}

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
