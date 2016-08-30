'use strict';

module.exports = {
  name: 'html',
  type: 'html',

  /**
   * Configure 'buddyConfig'
   * @param {Object} buddyConfig
   */
  config (buddyConfig) {
    buddyConfig.fileExtensions.push('html', 'htm');
    // workflow: []
  },

  /**
   * Extend 'File' with new behaviour
   * @param {Class} File
   * @returns {Class}
   */
  extend (File) {
    return class HTMLFile extends File {
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
        super(id, filepath, 'html', options);
      }
    };
  }
};