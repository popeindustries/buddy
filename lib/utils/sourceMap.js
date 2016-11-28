'use strict';

const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

module.exports = {
  create,
  append,
  prepend
};

/**
 * Create source map from 'content'
 * @param {String} content
 * @param {String} [url]
 * @returns {SourceMapGenerator}
 */
function create (content, url) {
  url = url || '<source>';
  const map = new SourceMapGenerator({ file: url });
  const lines = content.split('\n');

  for (let l = 1, n = lines.length; l <= n; l++) {
    // Skip empty
    if (lines[l - 1]) {
      map.addMapping({
        source: url,
        original: { line: l, column: 0 },
        generated: { line: l, column: 0 }
      });
    }
  }

  map.setSourceContent(url, content);
  return map;
}

/**
 * Append 'otherMap' to 'map' with line 'offset'
 * @param {SourceMapGenerator} map
 * @param {SourceMapGenerator} otherMap
 * @param {Number} offset
 */
function append (map, otherMap, offset = 0) {
  const consumer = new SourceMapConsumer(otherMap);

  consumer.eachMapping((mapping) => {
    map.addMapping({
      source: mapping.source,
      original: mapping.source == null ? null : {
        line: mapping.originalLine,
        column: mapping.originalColumn
      },
      generated: {
        line: offset + mapping.generatedLine,
        column: mapping.generatedColumn
      }
    });
  });

  map.setSourceContent(consumer.sources[0], consumer.sourcesContent[0]);
}

function prepend () {

}

function merge () {

}