'use strict';

const babel = require('babel-core');

/**
 * Transpile 'file' content based on Babel 'options'
 * @param {JSFile} file
 * @param {Object} options
 */
module.exports = function transpile (file, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return;

  options = Object.assign({ filename: file.filepath }, options);

  const transform = babel.transform(file.content, options);

  file.content = transform.code;
  // file.map = transform.map
};