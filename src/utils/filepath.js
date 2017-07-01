// @flow

'use strict';

const { isInvalid, isString, isNullOrUndefined } = require('./is');
const { regexpEscape } = require('./string');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');

const RE_UNIQUE_HASH_TOKEN = /%hash%/;
const RE_UNIQUE_TOKEN = /%(?:hash|date)%/;

const existsCache = new Set();

module.exports = {
  exists,
  isAbsoluteFilepath,
  isRelativeFilepath,

  /**
   * Determine if 'str' is a filepath or package reference
   */
  isFilepath(str: string): boolean {
    return !isInvalid(str) && (isAbsoluteFilepath(str) || isRelativeFilepath(str));
  },

  /**
   * Retrieve path name (dirname/filename) of 'p'
   */
  filepathName(p: string): string {
    p = path.resolve(p);

    let dir = path.resolve(p, '..');

    if (dir === process.cwd()) {
      dir = '.';
    }

    return `${path.basename(dir)}${path.sep}${path.basename(p)}`;
  },

  /**
   * Determine type of 'filepath'
   */
  filepathType(filepath: string, fileExtensions: Object): string {
    const ext = path.extname(filepath).slice(1);

    // Match input extension to type
    for (const type in fileExtensions) {
      const exts = fileExtensions[type];

      for (let i = 0, n = exts.length; i < n; i++) {
        if (ext === exts[i]) {
          return type;
        }
      }
    }

    return '';
  },

  /**
   * Check the location of 'filepath'
   */
  findFilepath(filepath: string, type: string, fileExtensions: Object): string {
    if (isString(filepath) && !isInvalid(type) && !isNullOrUndefined(fileExtensions)) {
      let stat;

      try {
        stat = fs.statSync(filepath);
      } catch (err) {
        /* no file */
      }

      // Already have full filepath
      if (stat != null && stat.isFile()) {
        return filepath;
      }

      let ext, fp;

      // Loop through fileExtensions and locate file
      for (let i = 0, n = fileExtensions[type].length; i < n; i++) {
        ext = fileExtensions[type][i];
        // Add extension
        fp = `${filepath}.${ext}`;
        if (exists(fp)) {
          return fp;
        }
        // Try 'index' + extension
        fp = path.resolve(filepath, `index.${ext}`);
        if (exists(fp)) {
          return fp;
        }
      }

      return '';
    }

    return filepath;
  },

  /**
   * Find file matching unique 'pattern'
   */
  findUniqueFilepath(pattern: string): string {
    pattern = path.resolve(pattern);

    // Limit scope to containing directory
    const dir = path.dirname(pattern);
    let files, reToken;

    // Matches {hash} or {date}
    if (!isNullOrUndefined((reToken = RE_UNIQUE_TOKEN.exec(pattern)))) {
      try {
        files = fs.readdirSync(dir);
      } catch (err) {
        // Directory doesn't exist
        return '';
      }

      // Generate regexp with pattern as wildcard
      const re = new RegExp(
        regexpEscape(pattern).replace(reToken[0], RE_UNIQUE_HASH_TOKEN.test(pattern) ? '[a-f0-9]{32}' : '[0-9]{13,}')
      );

      for (let i = 0, n = files.length; i < n; i++) {
        const filepath = path.resolve(dir, files[i]);

        if (re.test(filepath)) {
          return filepath;
        }
      }
    }

    return '';
  },

  /**
   * Generate unique filepath from 'pattern'
   */
  generateUniqueFilepath(pattern: string, content: string | boolean): string {
    pattern = path.resolve(pattern);

    let reToken, wildcard;

    if (!isNullOrUndefined((reToken = RE_UNIQUE_TOKEN.exec(pattern)))) {
      wildcard = reToken[0];
      if (wildcard === '%hash%') {
        // Remove if content == false
        // Hash content if not already a hash
        pattern = pattern.replace(wildcard, !isInvalid(content) ? (content.length == 32 ? content : md5(content)) : '');
      } else if (wildcard === '%date%') {
        pattern = pattern.replace(wildcard, content ? Date.now().toString() : '');
      }
    }

    return pattern;
  },

  /**
   * Determine whether 'pattern' is supported
   */
  isUniqueFilepath(pattern: string): boolean {
    return RE_UNIQUE_TOKEN.test(pattern);
  }
};

/**
 * Determine if 'filepath' exists
 */
function exists(filepath: string): boolean {
  // Only return positive to allow for generated files
  if (existsCache.has(filepath)) {
    return true;
  }

  const filepathExists = fs.existsSync(filepath);

  if (filepathExists) {
    existsCache.add(filepath);
  }

  return filepathExists;
}

/**
 * Determine if 'filepath' is relative
 * @param {String} filepath
 * @returns {Boolean}
 */
function isRelativeFilepath(filepath: string): boolean {
  return isString(filepath) && filepath.charAt(0) === '.';
}

/**
 * Determine if 'filepath' is absolute
 * @param {String} filepath
 * @returns {Boolean}
 */
function isAbsoluteFilepath(filepath: string): boolean {
  return isString(filepath) && path.resolve(filepath) === filepath;
}
