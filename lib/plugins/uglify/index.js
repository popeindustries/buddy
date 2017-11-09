'use strict';

const uglify = require('uglify-js');
const uglifyES = require('uglify-es');

const RE_LICENSE = /@preserve|@license|@cc_on/i;
const DEFAULT_OPTIONS = {
  output: {
    // Preserve special multiline comments
    comments: RE_LICENSE
  },
  compress: {
    // Don't remove wrapping brackets
    negate_iife: false
  }
};

module.exports = {
  name: 'uglify',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register(config) {
    config.extendFileDefinitionForExtensionsOrType(extend, null, this.type);
  }
};

/**
 * Extend 'prototype' with new behaviour
 * @param {Object} prototype
 * @param {Object} utils
 */
function extend(prototype, utils) {
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
  prototype.compress = function compress(buildOptions, fn) {
    const options = Object.assign(
      this.hasMaps
        ? {
            sourceMap: {
              content: this.map.toJSON(),
              url: this.mapUrl
            }
          }
        : {},
      DEFAULT_OPTIONS,
      this.options.pluginOptions.uglify || {}
    );
    const minified = minify(this.content, options);

    if ('error' in minified) {
      fn(minified.error);
      return;
    }

    debug(`compress: ${strong(this.relpath)}`, 4);
    this.setContent(sourceMapCommentStrip(minified.code));
    if (minified.map) {
      this.setMap(minified.map);
    }
    fn();
  };
}

/**
 * Minify 'content'
 * @param {String} content
 * @param {Object} options
 * @returns {Object}
 */
function minify(content, options) {
  let minified = uglify.minify(content, options);

  if ('error' in minified) {
    minified = uglifyES.minify(content, options);
  }

  return minified;
}
