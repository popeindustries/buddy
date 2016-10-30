'use strict';

const { isAbsoluteFilepath, isFilepath } = require('./utils');
const alias = require('./alias');
const cache = require('./cache');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');

/**
 * Retrieve id for 'filepath'
 * @param {String} filepath
 * @param {Object} [options]
 *  - {Object} fileExtensions
 * @returns {String}
 */
module.exports = function indentify (filepath, options) {
  options = config(options);

  let id = '';

  if (!fs.existsSync(filepath) || !isAbsoluteFilepath(filepath)) return id;

  // Return from cache
  if (id = cache.getFile(filepath)) return id;

  const pkgDetails = pkg.getDetails(filepath, options);

  if (id = pkg.resolveId(pkgDetails, filepath)) {
    // Cache
    cache.setFile({ id, path: filepath, version: pkgDetails.version });
  }

  return id;
};