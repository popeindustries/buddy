'use strict';

const { commentStrip, uniqueMatch } = require('../utils/string');

const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;

module.exports = {
  name: 'js',
  type: 'js',

  /**
   * Configure 'buddyConfig'
   * @param {Object} buddyConfig
   */
  config (buddyConfig) {
    buddyConfig.fileExtensions.push('js');
    // workflow: []
  },

  /**
   * Extend 'File' with new behaviour
   * @param {Class} File
   * @returns {Class}
   */
  extend (File) {
    return class JSFile extends File {
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
        super(id, filepath, 'js', options);

        this.ast = {};
        this.map = {};
      }

      /**
       * Parse file contents for dependency references
       * @param {Object} options
       * @param {Function} fn(err)
       */
      parse (options, fn) {
        super.addDependencies(uniqueMatch(commentStrip(this.content), RE_REQUIRE));
      }
    };
  }
};