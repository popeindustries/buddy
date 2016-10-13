'use strict';

const postcss = require('postcss');

/**
 * Transpile 'file' content based on Postcss 'options'
 * @param {JSFile} file
 * @param {Array} plugins
 * @param {Object} options
 * @param {Function} fn
 */
module.exports = function transpile (file, plugins, options, fn) {
  if (!plugins.length) return;

  options = Object.assign({ from: file.filepath }, options);

  postcss(plugins)
    .process(file.content, options)
    .then((result) => {
      file.content = result.css;
      // file.map = transform.map
      fn();
    })
    .catch(fn);
};