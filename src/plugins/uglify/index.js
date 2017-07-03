// @flow

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
  }
};

module.exports = {
  name: 'uglify',
  type: 'js',

  /**
   * Register plugin
   */
  register(config: Config) {
    config.extendFileDefinitionForExtensionsOrType(extend, null, this.type);
  }
};

/**
 * Extend 'prototype' with new behaviour
 */
function extend(prototype: Object, utils: Object) {
  const { debug, strong, warn } = utils.cnsl;
  const { sourceMapCommentStrip } = utils.string;

  /**
   * Compress file contents
   */
  prototype.compress = function compress(buildOptions: BuildOptions, fn: (?Error) => void) {
    try {
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
      const minified = uglify.minify(this.content, options);

      debug(`compress: ${strong(this.relpath)}`, 4);
      this.setContent(sourceMapCommentStrip(minified.code));
      if (minified.map) {
        this.setMap(minified.map);
      }
    } catch (err) {
      warn(
        `unable to compress ${strong(this.relpath)} with Uglify. Make sure the build version is set to ${strong('es5')} as Uglify doesn't yet support newer language features`,
        this.options.level
      );
    }
    fn();
  };
}
