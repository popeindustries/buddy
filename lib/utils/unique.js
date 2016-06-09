'use strict';

const escape = require('./reEscape.js');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');

const RE_HASH_TOKEN = /%hash%/;
const RE_TOKEN = /%(?:hash|date)%/;

/**
 * Find file matching 'pattern'
 * @param {String} pattern
 * @returns {String}
 */
exports.find = function find (pattern) {
  pattern = path.resolve(pattern);

  // Limit scope to containing directory
  const dir = path.dirname(pattern);
  let files, reToken;

  // Matches {hash} or {date}
  if (reToken = RE_TOKEN.exec(pattern)) {
    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      // Directory doesn't exist
      return '';
    }

    // Generate regexp with pattern as wildcard
    const re = new RegExp(escape(pattern).replace(reToken[0], RE_HASH_TOKEN.test(pattern) ? '[a-f0-9]{32}' : '[0-9]{13,}'));

    for (let i = 0, n = files.length; i < n; i++) {
      const filepath = path.resolve(dir, files[i]);

      if (re.test(filepath)) return filepath;
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

  let reToken, wildcard;

  if (reToken = RE_TOKEN.exec(pattern)) {
    wildcard = reToken[0];
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
  return RE_TOKEN.test(pattern);
};