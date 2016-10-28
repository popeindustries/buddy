'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Determine if 'filepath' is relative
 * @param {String} filepath
 * @returns {Boolean}
 */
exports.isRelativeFilepath = function (filepath) {
  return ('string' == typeof filepath && filepath.charAt(0) == '.');
};

/**
 * Determine if 'filepath' is absolute
 * @param {String} filepath
 * @returns {Boolean}
 */
exports.isAbsoluteFilepath = function (filepath) {
  return ('string' == typeof filepath && path.resolve(filepath) == filepath);
};

/**
 * Determine if 'str' is a filepath or package reference
 * @param {String} str
 * @returns {Boolean}
 */
exports.isFilepath = function (str) {
  return (str && (exports.isAbsoluteFilepath(str) || exports.isRelativeFilepath(str)));
};

/**
 * Determine file type for 'filepath'
 * @param {String} filepath
 * @param {Object} fileExtensions
 * @returns {String}
 */
exports.deriveType = function (filepath, fileExtensions) {
  const ext = path.extname(filepath).slice(1);

  // Match input extension to type
  for (const type in fileExtensions) {
    const exts = fileExtensions[type];

    for (let i = 0, n = exts.length; i < n; i++) {
      if (ext == exts[i]) return type;
    }
  }
};

/**
 * Check the location of 'filepath'
 * @param {String} filepath
 * @param {String} type
 * @param {Array} fileExtensions
 * @returns {String}
 */
exports.findFile = function (filepath, type, fileExtensions) {
  if ('string' == typeof filepath) {
    // Already have full filepath
    if (path.extname(filepath) && fs.existsSync(filepath)) return filepath;

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
};