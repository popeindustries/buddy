'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');

const RE_DYNAMIC_IMPORT = /buddyImport\(['"]([^'"]+)[^)]+\)/g;
const RE_IMPORT = /import[^'"]+['"]([^'"]+)['"]/g;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;

/**
 * Parse 'content' for dependencies
 * @param {String} content
 * @returns {Array}
 */
module.exports = function parse (content) {
  content = commentStrip(content);
  const requires = uniqueMatch(content, RE_REQUIRE);
  const imports = uniqueMatch(content, RE_IMPORT);
  const dynamicImports = uniqueMatch(content, RE_DYNAMIC_IMPORT);

  [requires, imports, dynamicImports].forEach((matches) => {
    matches.forEach((match) => {
      match.id = match.match;
    });
  });

  return [requires, imports, dynamicImports];
};