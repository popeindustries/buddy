'use strict';

module.exports = {
  /**
   * Register plugin
   * @returns {Object}
   */
  register () {
    return {
      name: 'html',
      extensions: {
        html: ['htm', 'html']
      }
    };
  },

  /**
   * Parse dependency references
   * @param {File} file
   * @returns {Array}
   */
  parse (file) {

  },

  /**
   * Replace dependency references
   * @param {File} file
   * @returns {String}
   */
  replace () {

  }
};