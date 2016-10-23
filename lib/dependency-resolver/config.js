'use strict';

const { execSync: exec } = require('child_process');
const alias = require('./alias');
const nativeModules = require('./nativeModules');
const path = require('path');
const union = require('lodash/union');

const DEFAULT_EXTENSIONS = {
  js: ['js', 'json'],
  css: ['css'],
  html: ['html']
};

/**
 * Parse and format 'options'
 * @param {Object} [options]
 *  - {Object} fileExtensions
 *  - {Object} globalAliases
 * @returns {Object}
 */
module.exports = function config (options) {
  options = options || {};
  options.fileExtensions = options.fileExtensions || {};

  return {
    fileExtensions: {
      js: union(options.fileExtensions.js || [], DEFAULT_EXTENSIONS.js),
      css: union(options.fileExtensions.css || [], DEFAULT_EXTENSIONS.css),
      html: union(options.fileExtensions.html || [], DEFAULT_EXTENSIONS.html)
    },
    globalAliases: alias.parse(process.cwd(), options.globalAliases || {}),
    globalSources: module.exports.globalSources,
    nativeModules,
    sources: module.exports.sources
  };
};

// Expose
module.exports.globalSources = resolveSources(true);
module.exports.sources = resolveSources(false);
module.exports.VERSION_DELIMITER = '#';

/**
 * Resolve sources
 * @param {Boolean} global
 * @returns {Array}
 */
function resolveSources (global) {
  const sources = global
    // Get global path from npm config
    ? [path.join(process.env.npm_config_prefix || exec('npm config get prefix', { encoding: 'utf8' }).replace('\n', ''), 'lib/node_modules')]
    : [...resolveEnvSources('NODE_PATH'), ...resolveEnvSources('BROWSER_PATH')];

  return sources.map((source) => path.resolve(source));
}

/**
 * Resolve environment variable sources for 'env'
 * @param {String} env
 * @returns {Array}
 */
function resolveEnvSources (env) {
  let paths = [];

  if (process.env[env]) {
    paths = ~process.env[env].indexOf(':')
      ? process.env[env].split(':')
      : [process.env[env]];
  }

  return paths;
}