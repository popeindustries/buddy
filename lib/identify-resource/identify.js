'use strict';

const { isAbsoluteFilepath } = require('./utils');
const cache = require('./cache');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');

/**
 * Retrieve id for 'filepath'
 * @param {String} filepath
 * @param {Object} [options]
 * @returns {String}
 */
module.exports = function indentify (filepath, options) {
  options = config(options);

  let id = '';

  if (!fs.existsSync(filepath) || !isAbsoluteFilepath(filepath)) return id;

  // Return from cache
  if (id = cache.getFile(filepath)) return id;

  const pkgDetails = pkg.getDetails(filepath, options);

  // Handle aliases
  if (filepath in pkgDetails.aliases) {
    const fp = pkgDetails.aliases[filepath];

    // Only follow alias if not disabled
    if (fp !== false) filepath = fp;
  }

  if (id = pkg.resolveId(pkgDetails, filepath)) {
    if (process.platform == 'win32') id = id.replace(/\\/g, '/');
    // Cache
    cache.setFile({ path: filepath, id });
  }

  return id;
};