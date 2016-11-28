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
 * Append 'inMap' to 'outMap' with 'offset'
 * @param {SourceMapGenerator} outMap
 * @param {SourceMapGenerator} inMap
 * @param {Number} offset
 */
function append (outMap, inMap, offset) {
  const inConsumer = new SourceMapConsumer(inMap.toJSON());

  inConsumer.eachMapping((mapping) => {
    outMap.addMapping({
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

  if (inConsumer.sources[0]) {
    outMap.setSourceContent(inConsumer.sources[0], inConsumer.sourcesContent[0]);
  }
}

/**
 * Prepend 'inMap' to 'outMap' with 'offset'
 * @param {SourceMapGenerator} outMap
 * @param {SourceMapGenerator} inMap
 * @param {Number} offset
 */
function prepend (outMap, inMap, offset) {
  const inConsumer = new SourceMapConsumer(inMap.toJSON());

  // Move existing mappings
  outMap._mappings.unsortedForEach((mapping) => {
    mapping.generatedLine += offset;
  });

  inConsumer.eachMapping((mapping) => {
    outMap.addMapping({
      source: mapping.source,
      original: mapping.source == null ? null : {
        line: mapping.originalLine,
        column: mapping.originalColumn
      },
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn
      }
    });
  });

  if (inConsumer.sources[0]) {
    outMap.setSourceContent(inConsumer.sources[0], inConsumer.sourcesContent[0]);
  }
}