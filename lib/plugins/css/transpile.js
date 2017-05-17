'use strict';

const { isEmptyArray } = require('../../utils/is');
const postcss = require('postcss');

/**
 * Transpile 'content' based on Postcss 'options'
 * @param {String} content
 * @param {String} filepath
 * @param {Array} plugins
 * @param {Object} options
 * @param {Function} fn
 * @returns {null}
 */
module.exports = function transpile(content, filepath, plugins, options, fn) {
  if (isEmptyArray(plugins)) {
    return fn(null, { code: content });
  }

  postcss(plugins)
    .process(content, options)
    .then(result => {
      fn(null, { code: result.css, map: result.map });
    })
    .catch(fn);
};
