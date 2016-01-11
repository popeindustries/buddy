'use strict';

const escape = require('./reEscape.js')
  , fs = require('fs')
  , md5 = require('md5')
  , path = require('path')

  , RE_UNIQUE = /%(?:hash|date)%/
  , PLACEHOLDER = '____';

/**
 * Find file matching 'pattern'
 * @param {String} pattern
 * @returns {String}
 */
exports.find = function find (pattern) {
  pattern = path.resolve(pattern);

  // Limit scope to containing directory
  const dir = path.dirname(pattern);

  let files, reUnique;

  // Matches {hash} or {date}
  if (reUnique = RE_UNIQUE.exec(pattern)) {
    try {
      files = fs.readdirSync(dir);

    } catch (err) {
      // Directory doesn't exist
      return '';
    }

    // Generate regexp with pattern as wildcard
    const re = new RegExp(escape(pattern.replace(reUnique[0], PLACEHOLDER)).replace(PLACEHOLDER, '(.+)'));

    for (let i = 0, n = files.length; i < n; i++) {
      const file = path.resolve(dir, files[i]);
      if (re.test(file)) return file;
    }
  }

  return '';
};

/**
 * Generate unique filepath from 'pattern'
 * @param {String} pattern
 * @param {String|Boolean} content
 * @returns {String}
 */
exports.generate = function generate (pattern, content) {
  pattern = path.resolve(pattern);

  let reUnique, wildcard;

  if (reUnique = RE_UNIQUE.exec(pattern)) {
    wildcard = reUnique[0];
    if (wildcard == '%hash%') {
      // Remove if content == false
      pattern = pattern.replace(wildcard, (content ? md5(content) : ''));
    } else if (wildcard == '%date%') {
      pattern = pattern.replace(wildcard, (content ? Date.now() : ''));
    }
  }

  return pattern;
};

/**
 * Determine whether 'pattern' is supported
 * @param {String} pattern
 * @returns {Boolean}
 */
exports.isUniquePattern = function isUniquePattern (pattern) {
  return RE_UNIQUE.test(pattern);
};