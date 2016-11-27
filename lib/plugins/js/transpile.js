'use strict';

const babel = require('babel-core');

/**
 * Transpile 'content' based on Babel 'options'
 * @param {String} content
 * @param {Object} options
 * @returns {String}
 */
module.exports = function transpile (content, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return { code: content, map: null };

  return babel.transform(content, options);
};