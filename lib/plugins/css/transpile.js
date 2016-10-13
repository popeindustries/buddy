'use strict';

const postcss = require('postcss');

/**
 * Transpile 'content' based on Babel 'options'
 * @param {JSFile} file
 * @param {Object} options
 */
module.exports = function transpile (file, options) {
  if (!options.plugins.length) return;

  options = Object.assign({ filename: file.filepath }, options);

  const transform = postcss.transform(file.content, options);

  file.content = transform.code;
  // file.map = transform.map
};