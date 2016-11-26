'use strict';

// Match {BUDDY_*}
const RE_ENV = /{(BUDDY_[0-9A-Z_]+)}/g;

/**
 * Replace process.env references with values
 * @param {MagicString} string
 */
module.exports = function replaceEnvironment (string) {
  const content = string.original;
  let match;

  RE_ENV.lastIndex = 0;

  // Find all matches
  while (match = RE_ENV.exec(content)) {
    const value = process.env[match[1]] || '';

    string.overwrite(match.index, match.index + match[0].length, value);
  }
};