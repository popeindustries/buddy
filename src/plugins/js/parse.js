// @flow

'use strict';

import type { DependencyReference } from '../../File';

const { commentStrip, uniqueMatch } = require('../../utils/string');

const RE_DYNAMIC_IMPORT = /(?:buddyImport|import)\(['"]([^'"]+)[^)]+\)/g;
const RE_IMPORT = /import[^'"]+['"]([^'"]+)['"]/g;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;

/**
 * Parse 'content' for dependencies
 */
module.exports = function parse(content: string): [Array<DependencyReference>, Array<DependencyReference>, Array<DependencyReference>] {
  content = commentStrip(content);

  return [
    (uniqueMatch(content, RE_REQUIRE): Array<DependencyReference>),
    (uniqueMatch(content, RE_IMPORT): Array<DependencyReference>),
    (uniqueMatch(content, RE_DYNAMIC_IMPORT): Array<DependencyReference>)
  ];
};
