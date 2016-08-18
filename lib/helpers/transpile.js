'use strict';

const babel = require('babel-core');

const SETTINGS = {
  plugins: [
    require('../utils/babel-plugin-namespace-vars')
  ]
};

/**
 * Transpile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
module.exports = function transpile (content, options, fn) {
  try {
    const transform = babel.transform(content, Object.assign({}, SETTINGS));

    fn(null, transform.code);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};