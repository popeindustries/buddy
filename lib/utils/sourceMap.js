'use strict';

const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

module.exports = {
  create,
  createFromMap,
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
 * Create source map from 'map' and 'content'
 * @param {Object} mapObject
 * @param {String} content
 * @param {String} [url]
 * @returns {SourceMapGenerator}
 */
function createFromMap (mapObject, content, url) {
  url = url || '<source>';
  if ('string' == typeof mapObject) {
    try {
      mapObject = JSON.parse(mapObject);
    } catch (err) {
      mapObject = {
        version: 3,
        names: [],
        mappings: '',
        file: ''
      };
    }
  }
  mapObject.sources = [url];
  mapObject.sourcesContent = [content];

  return SourceMapGenerator.fromSourceMap(new SourceMapConsumer(mapObject));
}

/**
 * Append 'inMap' to 'outMap' with line 'offset'
 * @param {SourceMapGenerator} outMap
 * @param {SourceMapGenerator} inMap
 * @param {Number} offset
 */
function append (outMap, inMap, offset) {
  if (inMap) {
    const inConsumer = new SourceMapConsumer(inMap.toJSON());

    inConsumer.eachMapping((mapping) => {
      outMap.addMapping({
        source: mapping.source,
        original: (mapping.source == null) ? null : {
          line: mapping.originalLine,
          column: mapping.originalColumn
        },
        generated: {
          line: offset + mapping.generatedLine,
          column: mapping.generatedColumn
        }
      });
    });

    inConsumer.sources.forEach((source, idx) => {
      outMap.setSourceContent(source, inConsumer.sourcesContent[idx]);
    });
  }
}

/**
 * Prepend 'inMap' to 'outMap' with line 'offset'
 * @param {SourceMapGenerator} outMap
 * @param {SourceMapGenerator} [inMap]
 * @param {Number} offset
 */
function prepend (outMap, inMap, offset) {
  // Move existing mappings
  outMap._mappings.unsortedForEach((mapping) => {
    mapping.generatedLine += offset;
  });

  if (inMap) {
    const inConsumer = new SourceMapConsumer(inMap.toJSON());

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

    inConsumer.sources.forEach((source, idx) => {
      outMap.setSourceContent(source, inConsumer.sourcesContent[idx]);
    });
  }
}