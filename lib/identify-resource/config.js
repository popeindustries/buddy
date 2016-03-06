'use strict';

const path = require('path')
  , union = require('lodash/union')

  , DEFAULT_EXTENSIONS = {
      js: ['js', 'json'],
      css: ['css'],
      html: ['html']
    }
  , NATIVE_MODULES = require('repl')._builtinLibs.concat('repl');

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
    sources: (options.sources || []).map(function (source) {
      return path.resolve(source);
    }),
    type: 'js'
  };
};

// Expose
module.exports.VERSION_DELIMITER = '#';
module.exports.nativeModules = NATIVE_MODULES;