'use strict';

module.exports = {
  /**
   * Register plugin
   * @returns {Object}
   */
  register () {
    return {
      name: 'css',
      extensions: {
        css: ['css']
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