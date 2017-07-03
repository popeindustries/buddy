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
 */
module.exports = function parse(content: string): [Array<Match>, Array<Match>, Array<Match>] {
  content = commentStrip(content);

  return [
    uniqueMatch(content, RE_REQUIRE),
    uniqueMatch(content, RE_IMPORT),
    uniqueMatch(content, RE_DYNAMIC_IMPORT)
  ];
};
