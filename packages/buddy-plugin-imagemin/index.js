'use strict';

const gifsicle = require('imagemin-gifsicle');
const imagemin = require('imagemin');
const jpegtran = require('imagemin-jpegtran');
const optipng = require('imagemin-optipng');
const svgo = require('imagemin-svgo');

module.exports = {
  name: 'imagemin',
  type: 'img',

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
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   */
  prototype.compress = function compress (buildOptions, fn) {
    let content = this.content;

    try {
      const asString = ('string' == typeof content);

      // Requires buffer
      if (asString) content = new Buffer(content);

      imagemin
        .buffer(content, {
          plugins: [
            gifsicle(),
            jpegtran(),
            optipng({ optimizationLevel: 3 }),
            svgo()
          ]
        })
        .then((content) => {
          debug(`compress: ${strong(this.relpath)}`, 4);
          if (asString) content = content.toString();
          this.content = content;
          fn();
        })
        .catch(fn);
    } catch (err) {
      fn(err);
    }
  };
}