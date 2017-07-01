// @flow

'use strict';

type Config = {
  browser: boolean,
  cache: ResolverCache,
  fileExtensions: { [string]: Array<string>},
  nativeModules: Array<string>,
  sources: Array<string>
};

const { execSync: exec } = require('child_process');
const { isInvalid } = require('../utils/is');
const nativeModules = require('../utils/nativeModules');
const path = require('path');
const ResolverCache = require('../cache/ResolverCache');
const union = require('lodash/union');
const unique = require('lodash/uniq');

const DEFAULT_EXTENSIONS = {
  js: ['js', 'json'],
  css: ['css'],
  html: ['html']
};

const sources = resolveSources();

/**
 * Parse and format 'options'
 * @param {Object} [options]
 *  - {Boolean} browser
 *  - {Object} fileExtensions
 * @returns {Object}
 */
module.exports = function config(options?: Object): Config {
  options = options || {};
  options.fileExtensions = options.fileExtensions || {};

  return {
    browser: 'browser' in options ? options.browser : true,
    cache: options.cache || new ResolverCache(),
    fileExtensions: {
      js: union(options.fileExtensions.js || [], DEFAULT_EXTENSIONS.js),
      css: union(options.fileExtensions.css || [], DEFAULT_EXTENSIONS.css),
      html: union(options.fileExtensions.html || [], DEFAULT_EXTENSIONS.html)
    },
    nativeModules,
    sources
  };
};

// Expose
module.exports.sources = sources;

/**
 * Resolve sources
 */
function resolveSources(): Array<string> {
  const sources = [
    ...resolveEnvSources('NODE_PATH'),
    ...resolveEnvSources('BROWSER_PATH'),
    // Get global path from npm config
    path.join(
      process.env.npm_config_prefix || exec('npm config get prefix', { encoding: 'utf8' }).replace('\n', ''),
      'lib/node_modules'
    )
  ];

  return unique(sources.map(source => source != null ? path.resolve(source) : null));
}

/**
 * Resolve environment variable sources for 'env'
 * @param {String} env
 * @returns {Array}
 */
function resolveEnvSources(env: string): Array<string> {
  let paths = [];

  if (!isInvalid(process.env[env])) {
    paths = process.env[env].includes(path.delimiter) ? process.env[env].split(path.delimiter) : [process.env[env]];
  }

  return paths;
}
