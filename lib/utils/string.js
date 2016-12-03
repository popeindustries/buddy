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
 * @param {String} string
 * @returns {String}
 */
function commentStrip (string) {
  // Remove commented lines
  string = string.replace(RE_COMMENT_SINGLE_LINE, '');
  string = string.replace(RE_COMMENT_MULTI_LINES, '');
  return string;
}

/**
 * Strip source map comment from 'string'
 * @param {String} string
 * @returns {String}
 */
function sourceMapCommentStrip (string) {
  return string.replace(RE_SOURCE_MAPPING_URL, '');
}

/**
 * Wrap 'string' in comment based on 'type'
 * @param {String} string
 * @param {String} type
 * @returns {String}
 */
function commentWrap (string, type) {
  let open, close;

  if (type == 'html') {
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
 * @param {String} string
 * @param {Int} column
 * @returns {String}
 */
function indent (string, column) {
  const spaces = (new Array(++column)).join(COLUMN);

  return string.replace(RE_LINE_BEGIN, spaces);
}

/**
 * Match unique occurrences in 'string'
 * @param {String} string
 * @param {RegExp} regexp
 * @returns {Array}
 */
function uniqueMatch (string, regexp) {
  let results = [];
  let match;

  while (match = regexp.exec(string)) {
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
 * @param {String} string
 * @returns {String}
 */
function regexpEscape (string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Truncate 'string'
 * @param {String} string
 * @returns {String}
 */
function truncate (string) {
  if (string.length > (SEG_LENGTH * 2) + 3) {
    return string.slice(0, SEG_LENGTH) + '...' + string.slice(-SEG_LENGTH);
  }

  return string;
}

/**
 * Retrieve line/column from 'index' of 'string'
 * Column is zero-indexed
 * @param {String} string
 * @param {Number} index
 * @returns {Object}
 */
function getLocationFromIndex (string, index) {
  const lines = string.split('\n');
  let destructure = false;
  let idx = 0;
  let results = [];
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
    if (!m) break;

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

    if (found.length) {
      for (let k = 0, n = found.length; k < n; k++) {
        // Remove index (correct for previous removals)
        index.splice(found[k] - k, 1);
      }
      found = [];
    }
    idx += lineLength;
  }

  if (results.length) return destructure ? results[0] : results;
  return { line: 0, column: 0 };
}