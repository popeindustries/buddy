'use strict';

const csso = require('csso');

module.exports = {
  name: 'csso',
  type: 'css',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.extendFileDefinitionForExtensionsOrType(extend, null, this.type);
  }
};

/**
 * Extend 'prototype' with new behaviour
 * @param {Object} prototype
 * @param {Object} utils
 */
function extend (prototype, utils) {
  const { debug, strong } = utils.cnsl;

  /**
   * Compress file contents
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} includeHeader
   *  - {Boolean} includeHelpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  prototype.compress = function compress (buildOptions, fn) {
    try {
      const content = csso.minify(this.content).css;

      debug(`compress: ${strong(this.relpath)}`, 4);
      this.content = content;
      fn();
    } catch (err) {
      fn(err);
    }
  };
}