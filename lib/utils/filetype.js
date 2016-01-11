'use strict';

const path = require('path');

/**
 * Determine type of 'filepath'
 * @param {String} filepath
 * @param {Object} fileExtensions
 * @returns {String}
 */
module.exports = function filetype (filepath, fileExtensions) {
  const ext = path.extname(filepath).slice(1);

  // Match input extension to type
  for (const t in fileExtensions) {
    const exts = fileExtensions[t];

    for (let i = 0, n = exts.length; i < n; i++) {
      if (ext == exts[i]) return t;
    }
  }

  return 'unknown';
};