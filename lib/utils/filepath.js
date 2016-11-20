'use strict';

const { regexpEscape } = require('./string');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');

const RE_UNIQUE_HASH_TOKEN = /%hash%/;
const RE_UNIQUE_TOKEN = /%(?:hash|date)%/;

module.exports = {
  isAbsoluteFilepath,
  isRelativeFilepath,

  /**
   * Determine if 'str' is a filepath or package reference
   * @param {String} str
   * @returns {Boolean}
   */
  isFilepath (str) {
    return (str && (isAbsoluteFilepath(str) || isRelativeFilepath(str)));
  },

  /**
   * Retrieve path name (dirname/filename) of 'p'
   * @param {String} p
   * @returns {String}
   */
  filepathName (p) {
    p = path.resolve(p);

    let dir = path.resolve(p, '..');

    if (dir == process.cwd()) dir = '.';

    return `${path.basename(dir)}${path.sep}${path.basename(p)}`;
  },

  /**
   * Determine type of 'filepath'
   * @param {String} filepath
   * @param {Object} fileExtensions
   * @returns {String}
   */
  filepathType (filepath, fileExtensions) {
    const ext = path.extname(filepath).slice(1);

    // Match input extension to type
    for (const t in fileExtensions) {
      const exts = fileExtensions[t];

      for (let i = 0, n = exts.length; i < n; i++) {
        if (ext == exts[i]) return t;
      }
    }

    return '';
  },

  /**
   * Check the location of 'filepath'
   * @param {String} filepath
   * @param {String} type
   * @param {Array} fileExtensions
   * @returns {String}
   */
  findFilepath (filepath, type, fileExtensions) {
    if ('string' == typeof filepath && type && fileExtensions) {
      let stat;

      try {
        stat = fs.statSync(filepath);
      } catch (err) { /* no file */}

      // Already have full filepath
      if (stat && stat.isFile()) return filepath;

      let ext, fp;

      // Loop through fileExtensions and locate file
      for (let i = 0, n = fileExtensions[type].length; i < n; i++) {
        ext = fileExtensions[type][i];
        // Add extension
        fp = filepath + '.' + ext;
        if (fs.existsSync(fp)) return fp;
        // Try 'index' + extension
        fp = path.resolve(filepath, `index.${ext}`);
        if (fs.existsSync(fp)) return fp;
      }

      return '';
    }

    return filepath;
  },

  /**
   * Find file matching unique 'pattern'
   * @param {String} pattern
   * @returns {String}
   */
  findUniqueFilepath (pattern) {
    pattern = path.resolve(pattern);

    // Limit scope to containing directory
    const dir = path.dirname(pattern);
    let files, reToken;

    // Matches {hash} or {date}
    if (reToken = RE_UNIQUE_TOKEN.exec(pattern)) {
      try {
        files = fs.readdirSync(dir);
      } catch (err) {
        // Directory doesn't exist
        return '';
      }

      // Generate regexp with pattern as wildcard
      const re = new RegExp(regexpEscape(pattern).replace(reToken[0], RE_UNIQUE_HASH_TOKEN.test(pattern) ? '[a-f0-9]{32}' : '[0-9]{13,}'));

      for (let i = 0, n = files.length; i < n; i++) {
        const filepath = path.resolve(dir, files[i]);

        if (re.test(filepath)) return filepath;
      }
    }

    return '';
  },

  /**
   * Generate unique filepath from 'pattern'
   * @param {String} pattern
   * @param {String|Boolean} content
   * @returns {String}
   */
  generateUniqueFilepath (pattern, content) {
    pattern = path.resolve(pattern);

    let reToken, wildcard;

    if (reToken = RE_UNIQUE_TOKEN.exec(pattern)) {
      wildcard = reToken[0];
      if (wildcard == '%hash%') {
        // Remove if content == false
        // Hash content if not already a hash
        pattern = pattern.replace(wildcard, (content
          ? content.length == 32
            ? content
            : md5(content)
          : '')
        );
      } else if (wildcard == '%date%') {
        pattern = pattern.replace(wildcard, (content ? Date.now() : ''));
      }
    }

    return pattern;
  },

  /**
   * Determine whether 'pattern' is supported
   * @param {String} pattern
   * @returns {Boolean}
   */
  isUniqueFilepath (pattern) {
    return RE_UNIQUE_TOKEN.test(pattern);
  }
};

/**
 * Determine if 'filepath' is relative
 * @param {String} filepath
 * @returns {Boolean}
 */
function isRelativeFilepath (filepath) {
  return ('string' == typeof filepath && filepath.charAt(0) == '.');
}

/**
 * Determine if 'filepath' is absolute
 * @param {String} filepath
 * @returns {Boolean}
 */
function isAbsoluteFilepath (filepath) {
  return ('string' == typeof filepath && path.resolve(filepath) == filepath);
}
