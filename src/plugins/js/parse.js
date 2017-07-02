// @flow

'use strict';

type Match = {
  id: string,
  context: string,
  match: string
};

const { commentStrip, uniqueMatch } = require('../../utils/string');

const RE_DYNAMIC_IMPORT = /(?:buddyImport|import)\(['"]([^'"]+)[^)]+\)/g;
const RE_IMPORT = /import[^'"]+['"]([^'"]+)['"]/g;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;

/**
 * Parse 'content' for dependencies
 * @param {String} content
 * @returns {Array}
 */
module.exports = function parse(content: string): [Array<Match>, Array<Match>, Array<Match>] {
  content = commentStrip(content);

  const results = [
    uniqueMatch(content, RE_REQUIRE),
    uniqueMatch(content, RE_IMPORT),
    uniqueMatch(content, RE_DYNAMIC_IMPORT)
  ];

  results.forEach(matches => {
    matches.forEach(match => {
      match.id = match.match;
    });
  });

  return results;
};
