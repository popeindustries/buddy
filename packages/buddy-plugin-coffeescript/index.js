'use strict';

const coffee = require('coffee-script');

const DEFAULT_OPTIONS = {
  // Compile without function wrapper
  bare: true
};
const FILE_EXTENSIONS = ['coffee'];

module.exports = {
  name: 'coffeescript',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'File' with new behaviour
 * @param {Class} File
 * @param {Object} utils
 * @returns {Class}
 */
function define (File, utils) {
  const { debug, error, strong } = utils.cnsl;

  return class COFFEESCRIPTFile extends File {
    /**
     * Compile file contents
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    compile (buildOptions, fn) {
      try {
        const options = Object.assign({ sourceMap: this.hasMaps }, DEFAULT_OPTIONS, this.options.pluginOptions.coffeescript || {});
        const results = coffee.compile(this.content, options);
        let content, map;

        if ('string' != typeof results) {
          content = results.js;
          map = results.v3SourceMap;
        } else {
          content = results;
        }

        this.setContent(content);
        if (map) this.setMap(map);
        debug(`compile: ${strong(this.relpath)}`, 4);
      } catch (err) {
        if (!this.options.runtimeOptions.watch) return fn(err);
        error(err, 4, false);
      }
      fn();
    }
  };
}