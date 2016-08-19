'use strict';

const babel = require('babel-core');
const pluginNamespaceRootDeclarations = require('../utils/babel-plugin-namespace-root-declarations');

/**
 * Transpile 'content'
 * @param {String} id
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
module.exports = function transpile (id, content, options, fn) {
  try {
    const transform = babel.transform(content, {
      plugins: [
        [pluginNamespaceRootDeclarations, { id }]
      ]
    });

    fn(null, transform.code);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};