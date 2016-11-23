'use strict';

const babel = require('babel-core');

/**
 * Transpile 'content' based on Babel 'options'
 * @param {String} filepath
 * @param {String} content
 * @param {Object} options
 * @returns {Object}
 */
module.exports = function transpile (filepath, content, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return { content };

  options = Object.assign({ filename: filepath }, options);

  const transform = babel.transform(content, options);

  return {
    content: transform.code,
    map: transform.map
  };
};