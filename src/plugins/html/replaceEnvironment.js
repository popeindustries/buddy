// @flow

'use strict';

const { regexpEscape } = require('../../utils/string');

// Match {BUDDY_*}
const RE_ENV = /{(BUDDY_[0-9A-Z_]+)}/g;

/**
 * Replace process.env references with values
 */
module.exports = function replaceEnvironment(content: string): string {
  const matches = {};
  let match;

  RE_ENV.lastIndex = 0;

  // Find all matches
  while ((match = RE_ENV.exec(content))) {
    matches[match[0]] = process.env[match[1]] || '';
  }

  // Replace all references
  for (const context in matches) {
    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(context), 'g'), matches[context]);
  }

  return content;
};
