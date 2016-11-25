'use strict';

const babel = require('babel-core');

const RE_STRICT = /'use strict';?\s?/g;

/**
 * Transpile 'content' based on Babel 'options'
 * @param {String} content
 * @param {Object} options
 * @returns {String}
 */
module.exports = function transpile (content, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return content;

  const transform = babel.transform(content, options);

  RE_STRICT.lastIndex = 0;
  return transform.code.replace(RE_STRICT, '');
};