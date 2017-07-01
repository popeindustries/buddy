// @flow

'use strict';

const isEqual = require('lodash/isEqual');
const unique = require('lodash/uniqWith');

const COLUMN = ' ';
// Line starting with '//'
const RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
// Multi line block '/** ... */'
const RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;
const RE_LINE_BEGIN = /^/gm;
const RE_SOURCE_MAPPING_URL = /\n?\/\/# sourceMappingURL=[^\s]+/;
const SEG_LENGTH = 30;

module.exports = {
  commentStrip,
  sourceMapCommentStrip,
  commentWrap,
  indent,
  uniqueMatch,
  regexpEscape,
  truncate,
  getLocationFromIndex
};

/**
 * Strip comments from 'string'
 */
function commentStrip(string: string): string {
  // Remove commented lines
  string = string.replace(RE_COMMENT_SINGLE_LINE, '');
  string = string.replace(RE_COMMENT_MULTI_LINES, '');
  return string;
}

/**
 * Strip source map comment from 'string'
 */
function sourceMapCommentStrip(string: string): string {
  return string.replace(RE_SOURCE_MAPPING_URL, '');
}

/**
 * Wrap 'string' in comment based on 'type'
 */
function commentWrap(string: string, type: string): string {
  let open, close;

  if (type === 'html') {
    open = '<!-- ';
    close = ' -->';
  } else {
    open = '/* ';
    close = ' */';
  }

  return open + string + close;
}

/**
 * Indent the given 'string' a specific number of columns
 */
function indent(string: string, column: number): string {
  const spaces = new Array(++column).join(COLUMN);

  return string.replace(RE_LINE_BEGIN, spaces);
}

/**
 * Match unique occurrences in 'string'
 */
function uniqueMatch(string: string, regexp: RegExp): Array<{}> {
  const results = [];
  let match;

  while ((match = regexp.exec(string))) {
    results.push({
      context: match[0],
      match: match[1] || ''
    });
  }

  // Filter duplicates
  return unique(results, isEqual);
}

/**
 * Escape 'string' for use in RegExp constructor
 */
function regexpEscape(string: string): string {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Truncate 'string'
 */
function truncate(string: string): string {
  if (string.length > SEG_LENGTH * 2 + 3) {
    return string.slice(0, SEG_LENGTH) + '...' + string.slice(-SEG_LENGTH);
  }

  return string;
}

/**
 * Retrieve line/column from 'index' of 'string'
 * Column is zero-indexed
 */
function getLocationFromIndex(string: string, index: number | Array<number>): { line: number, column: number } {
  const lines = string.split('\n');
  let destructure = false;
  let idx = 0;
  const results = [];
  let found = [];

  // Convert to batch
  if (!Array.isArray(index)) {
    index = [index];
    destructure = true;
  }

  for (let i = 0, l = lines.length; i < l; i++) {
    const m = index.length;
    const line = lines[i];
    // Add removed line ending
    const lineLength = line.length + 1;

    // Abort if no more indexes
    if (m === 0) {
      break;
    }

    // Loop through remaining indexes
    for (let j = 0; j < m; j++) {
      // Store result if index in current line
      if (idx + lineLength > index[j]) {
        results.push({
          line: i + 1,
          column: index[j] - idx
        });
        // Store matched index for later removal
        found.push(j);
      }
    }

    if (found.length > 0) {
      for (let k = 0, n = found.length; k < n; k++) {
        // Remove index (correct for previous removals)
        index.splice(found[k] - k, 1);
      }
      found = [];
    }
    idx += lineLength;
  }

  if (results.length > 0) {
    return destructure ? results[0] : results;
  }
  return { line: 0, column: 0 };
}
