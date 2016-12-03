'use strict';

const { execSync: exec } = require('child_process');
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

/**
 * Parse and format 'options'
 * @param {Object} [options]
 *  - {Boolean} browser
 *  - {Object} fileExtensions
 * @returns {Object}
 */
module.exports = function config (options) {
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
    sources: module.exports.sources
  };
};

// Expose
module.exports.sources = resolveSources();
module.exports.VERSION_DELIMITER = '#';

/**
 * Resolve sources
 * @returns {Array}
 */
function resolveSources () {
  const sources = [
    ...resolveEnvSources('NODE_PATH'),
    ...resolveEnvSources('BROWSER_PATH'),
    // Get global path from npm config
    path.join(process.env.npm_config_prefix || exec('npm config get prefix', { encoding: 'utf8' }).replace('\n', ''), 'lib/node_modules')
  ];

  return unique(sources.map((source) => path.resolve(source)));
}

/**
 * Resolve environment variable sources for 'env'
 * @param {String} env
 * @returns {Array}
 */
function resolveEnvSources (env) {
  let paths = [];

  if (process.env[env]) {
    paths = process.env[env].includes(path.delimiter)
      ? process.env[env].split(path.delimiter)
      : [process.env[env]];
  }

  return paths;
}