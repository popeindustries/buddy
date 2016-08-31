'use strict';

const unique = require('lodash/uniq');

// Line starting with '//'
const RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
// Multi line block '/** ... */'
const RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;
const SEG_LENGTH = 30;

module.exports = {
  /**
   * Strip comments from 'str'
   * @param {String} str
   * @returns {String}
   */
  commentStrip (str) {
    // Remove commented lines
    str = str.replace(RE_COMMENT_SINGLE_LINE, '');
    str = str.replace(RE_COMMENT_MULTI_LINES, '');
    return str;
  },

  /**
   * Wrap 'str' in comment based on 'type'
   * @param {String} str
   * @param {String} type
   * @returns {String}
   */
  commentWrap (str, type) {
    let open, close;

    if (type == 'html') {
      open = '<!-- ';
      close = ' -->';
    } else {
      open = '/* ';
      close = ' */';
    }

    return open + str + close;
  },

  /**
   * Match unique occurances in 'str'
   * @param {String} str
   * @param {RegExp} regexp
   * @returns {Array}
   */
  uniqueMatch (str, regexp) {
    let results = [];
    let match;

    while (match = regexp.exec(str)) {
      results.push({
        context: match[0],
        match: match[1] || ''
      });
    }

    // Filter duplicates
    return unique(results, (result) => result.match || result.context);
  },

  /**
   * Escape 'str' for use in RegExp constructor
   * @param {String} str
   * @returns {String}
   */
  regexpEscape (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /**
   * Truncate 'str'
   * @param {String} str
   * @returns {String}
   */
  truncate (str) {
    if (str.length > (SEG_LENGTH * 2) + 3) {
      return str.slice(0, SEG_LENGTH) + '...' + str.slice(-SEG_LENGTH);
    }

    return str;
  }
};