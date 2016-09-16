'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');

const FILE_EXTENSIONS = ['css'];
const RE_IMPORT = /@import\s['"]([^'"]+)['"];?/g;

module.exports = {
  name: 'css',
  type: 'css',

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
 * @returns {Class}
 */
function define (File) {
  return class CSSFile extends File {
    /**
     * Constructor
     * @param {String} id
     * @param {String} filepath
     * @param {Object} options
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'css', options);

      this.ast = {};
      this.map = {};
    }

    /**
     * Parse file contents for dependency references
     * @param {Object} options
     * @param {Function} fn(err)
     */
    parse (options, fn) {
      super.addDependencies(uniqueMatch(commentStrip(this.content), RE_IMPORT));
    }
  };
}