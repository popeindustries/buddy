'use strict';

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
module.exports = function transpile (content, filepath, plugins, options, fn) {
  if (!plugins.length) return fn(null, content);

  options = Object.assign({ from: filepath, map: {
    annotation: false,
    inline: false
  } }, options);

  postcss(plugins)
    .process(content, options)
    .then((result) => {
      fn(null, result.css);
    })
    .catch(fn);
};