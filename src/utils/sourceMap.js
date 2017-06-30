// @flow

type MapObject = {
  sources: Array<string>,
  sourcesContent: Array<string>
};

'use strict';

const { isEmptyArray, isInvalid, isNullOrUndefined } = require('./is');
const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

module.exports = {
  create,
  createFromMap,
  clone,
  append,
  prepend,
  insert
};

/**
 * Create source map from 'content'
 * @param {String} content
 * @param {String} [url]
 * @returns {SourceMapGenerator}
 */
function create(content: string, url: string): SourceMapGenerator {
  url = url || '<source>';
  const map = new SourceMapGenerator({ file: url });
  const lines = content.split('\n');

  for (let l = 1, n = lines.length; l <= n; l++) {
    // Skip empty
    if (!isInvalid(lines[l - 1])) {
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
 * Create source map from 'mapObject' and 'content'
 * @returns {SourceMapGenerator}
 */
function createFromMap(mapObject: MapObject, content: string, url: ?string): SourceMapGenerator {
  url = url || '<source>';
  if (typeof mapObject === 'string') {
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
  if (emptySources(mapObject)) {
    mapObject.sources = [url];
    mapObject.sourcesContent = [content];
  }

  return SourceMapGenerator.fromSourceMap(new SourceMapConsumer(mapObject));
}

/**
 * Clone 'map'
 */
function clone(map: SourceMapGenerator): SourceMapGenerator {
  return map instanceof SourceMapGenerator
    ? SourceMapGenerator.fromSourceMap(new SourceMapConsumer(map.toJSON()))
    : map;
}

/**
 * Append 'inMap' to 'outMap' with line 'offset'
 */
function append(outMap: SourceMapGenerator, inMap: SourceMapGenerator, offset: number) {
  if (inMap != null) {
    const inConsumer = new SourceMapConsumer(inMap.toJSON());

    inConsumer.eachMapping(mapping => {
      outMap.addMapping({
        source: mapping.source,
        original: isNullOrUndefined(mapping.source)
          ? null
          : {
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
 */
function prepend(outMap: SourceMapGenerator, inMap: SourceMapGenerator, offset: number) {
  // Move existing mappings
  outMap._mappings.unsortedForEach(mapping => {
    mapping.generatedLine += offset;
  });

  if (!isNullOrUndefined(inMap)) {
    const inConsumer = new SourceMapConsumer(inMap.toJSON());

    inConsumer.eachMapping(mapping => {
      outMap.addMapping({
        source: mapping.source,
        original: isNullOrUndefined(mapping.source)
          ? null
          : {
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

/**
 * Insert line in 'outMap' with 'inMap' at line 'index'
 */
function insert(
  outMap: SourceMapGenerator,
  inMap: ?SourceMapGenerator,
  length: number,
  index: number
) {
  // Move existing mappings
  if (length > 0) {
    outMap._mappings.unsortedForEach(mapping => {
      if (mapping.generatedLine > index) {
        mapping.generatedLine += length;
      }
    });
  }

  // Add new mappings
  if (inMap != null) {
    const inConsumer = new SourceMapConsumer(inMap.toJSON());

    inConsumer.eachMapping(mapping => {
      outMap.addMapping({
        source: mapping.source,
        original: isNullOrUndefined(mapping.source)
          ? null
          : {
              line: mapping.originalLine,
              column: mapping.originalColumn
            },
        generated: {
          line: index + mapping.generatedLine - 1,
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
 * Determine if 'mapObject' has empty sources
 */
function emptySources(mapObject: MapObject) {
  return (
    isNullOrUndefined(mapObject.sources) ||
    isEmptyArray(mapObject.sources) ||
    isNullOrUndefined(mapObject.sourcesContent) ||
    isEmptyArray(mapObject.sourcesContent) ||
    mapObject.sources.length !== mapObject.sourcesContent.length
  );
}
