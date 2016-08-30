'use strict';

module.exports = {
  name: 'css',
  type: 'css',

  /**
   * Configure 'buddyConfig'
   * @param {Object} buddyConfig
   */
  config (buddyConfig) {
    buddyConfig.fileExtensions.push('css');
    // workflow: []
  },

  /**
   * Extend 'File' with new behaviour
   * @param {Class} File
   * @returns {Class}
   */
  extend (File) {
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
      }
    };
  }
};