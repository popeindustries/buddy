'use strict';

const { isAbsoluteFilepath } = require('../utils/filepath');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');

/**
 * Retrieve id for 'filepath'
 * @param {String} filepath
 * @param {Object} [options]
 *  - {Boolean} browser
 *  - {ResolverCache} cache
 *  - {Object} fileExtensions
 *  - {Array} nativeModules
 *  - {Array} sources
 * @returns {String}
 */
module.exports = function indentify (filepath, options) {
  options = config(options);

  const { cache } = options;
  let id = '';

  if (!fs.existsSync(filepath) || !isAbsoluteFilepath(filepath)) return id;

  // Return from cache
  if (id = cache.getFile(filepath)) return id;

  const pkgDetails = pkg.getDetails(filepath, options);

  if (id = pkg.resolveId(pkgDetails, filepath)) {
    // Cache
    cache.setFile({ id, path: filepath, version: pkgDetails.version }, config.VERSION_DELIMITER);
  }

  return id;
};