'use strict';

const cache = require('./cache')
  , config = require('./config')
  , fs = require('fs')
  , pkg = require('./package')
  , utils = require('./utils');

/**
 * Retrieve id for 'filepath'
 * @param {String} filepath
 * @param {Object} [options]
 * @returns {String}
 */
module.exports = function indentify (filepath, options) {
  options = config(options);

  let id = '';

  if (!fs.existsSync(filepath) || !utils.isAbsoluteFilepath(filepath)) return id;

  // Return from cache
  if (id = cache.getFile(filepath)) return id;

  const pkgDetails = pkg.get(filepath, options);

  // Handle aliases
  if (filepath in pkgDetails.aliases) {
    const fp = pkgDetails.aliases[filepath];

    // Only follow alias if not disabled
    if (fp !== false) filepath = fp;
  }

  id = pkg.resolveId(pkgDetails, filepath);

  // Cache
  if (id) {
    cache.setFile({
      path: filepath,
      id: id
    });
  }

  if (process.platform == 'win32') id = id.replace(/\\/g, '/');

  return id;
};