'use strict';

const isEqual = require('lodash/isEqual');
const unique = require('lodash/uniqWith');

const COLUMN = ' ';
// Line starting with '//'
const RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
// Multi line block '/** ... */'
const RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;
const RE_LINE_BEGIN = /^/gm;
const SEG_LENGTH = 30;

module.exports = {
  /**
   * Strip comments from 'string'
   * @param {String} string
   * @returns {String}
   */
  commentStrip (string) {
    // Remove commented lines
    string = string.replace(RE_COMMENT_SINGLE_LINE, '');
    string = string.replace(RE_COMMENT_MULTI_LINES, '');
    return string;
  },

  /**
   * Wrap 'string' in comment based on 'type'
   * @param {String} string
   * @param {String} type
   * @returns {String}
   */
  commentWrap (string, type) {
    let open, close;

    if (type == 'html') {
      open = '<!-- ';
      close = ' -->';
    } else {
      open = '/* ';
      close = ' */';
    }

    return open + string + close;
  },

  /**
   * Indent the given 'string' a specific number of columns
   * @param {String} string
   * @param {Int} column
   * @returns {String}
   */
  indent (string, column) {
    const spaces = (new Array(++column)).join(COLUMN);

    return string.replace(RE_LINE_BEGIN, spaces);
  },

  /**
   * Match unique occurrences in 'string'
   * @param {String} string
   * @param {RegExp} regexp
   * @returns {Array}
   */
  uniqueMatch (string, regexp) {
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
  },

  /**
   * Escape 'string' for use in RegExp constructor
   * @param {String} string
   * @returns {String}
   */
  regexpEscape (string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /**
   * Truncate 'string'
   * @param {String} string
   * @returns {String}
   */
  truncate (string) {
    if (string.length > (SEG_LENGTH * 2) + 3) {
      return string.slice(0, SEG_LENGTH) + '...' + string.slice(-SEG_LENGTH);
    }

    return string;
  },

  /**
   * Replace matched content in 'string' with 'content'
   * @param {MagicString} string
   * @param {RegExp} re
   * @param {String} content
   */
  replace (string, re, content) {
    const str = string.original;
    let match;

    while (match = re.exec(str)) {
      string.overwrite(match.index, match.index + match[0].length, content);
    }
  }
};