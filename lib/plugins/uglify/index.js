'use strict';

const uglify = require('uglify-js');

const RE_LICENSE = /@preserve|@license|@cc_on/i;
const DEFAULT_OPTIONS = {
  output: {
    // Preserve special multiline comments
    comments: RE_LICENSE
  },
  compress: {
    // Don't remove wrapping brackets
    negate_iife: false
  },
  fromString: true
};

module.exports = {
  name: 'uglify',
  type: 'js',

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
  const { debug, strong, warn } = utils.cnsl;
  const { sourceMapCommentStrip } = utils.string;

  /**
   * Compress file contents
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  prototype.compress = function compress (buildOptions, fn) {
    try {
      const options = Object.assign(
        this.hasMaps ? { inSourceMap: this.map.toJSON(), outSourceMap: this.mapUrl } : {},
        DEFAULT_OPTIONS,
        this.options.pluginOptions.uglify || {}
      );
      const minified = uglify.minify(this.content, options);

      debug(`compress: ${strong(this.relpath)}`, 4);
      this.setContent(sourceMapCommentStrip(minified.code));
      if (minified.map) this.setMap(minified.map);
    } catch (err) {
      warn(`unable to compress ${strong(this.relpath)} with Uglify. Make sure the build version is set to ${strong('es5')} as Uglify doesn't yet support newer language features`, 2);
    }
    fn();
  };
}