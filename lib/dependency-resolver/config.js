'use strict';

const path = require('path');
const union = require('lodash/union');

const DEFAULT_EXTENSIONS = {
  js: ['js', 'json'],
  css: ['css'],
  html: ['html']
};
const NATIVE_MODULES = require('repl')._builtinLibs.concat('repl', 'module');

/**
 * Parse and format 'options'
 * @param {Object} [options]
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
    nativeModules: NATIVE_MODULES,
    sources: (options.sources || []).map((source) => path.resolve(source))
  };
};

// Expose
module.exports.VERSION_DELIMITER = '#';
module.exports.nativeModules = NATIVE_MODULES;