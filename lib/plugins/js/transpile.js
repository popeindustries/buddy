'use strict';

const { SourceMapConsumer, SourceNode } = require('source-map');
const babel = require('babel-core');

/**
 * Transpile 'content' based on Babel 'options'
 * @param {String} content
 * @param {Object} options
 * @returns {Object}
 */
module.exports = function transpile (content, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return { content };

  const transform = babel.transform(content, options);

  return {
    content: transform.code,
    map: SourceNode.fromStringWithSourceMap(
      transform.code,
      new SourceMapConsumer(transform.map)
    )
  };
};