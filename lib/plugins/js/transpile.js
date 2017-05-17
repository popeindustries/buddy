'use strict';

const { isEmptyArray, isNullOrUndefined } = require('../../utils/is');
const babel = require('babel-core');

/**
 * Transpile 'content' based on Babel 'options'
 * @param {String} content
 * @param {Object} options
 * @returns {String}
 */
module.exports = function transpile(content, options) {
  if (isEmptyArray(options.plugins) || (!isNullOrUndefined(options.presets) && isEmptyArray(options.presets))) {
    return { code: content, map: null };
  }

  return babel.transform(content, options);
};
