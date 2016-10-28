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

  // Resolve aliases
  id = alias.resolve(filepath, pkgDetails.aliases);
  // Ignore disabled (false)
  id = id || filepath;
  // Return if resolved id
  if (!isFilepath(id)) return id;
  // Resolve alias to id
  id = alias.resolveReverse(id, pkgDetails.aliases);
  // Return if resolved id
  if (!isFilepath(id)) return id;

  if (id = pkg.resolveId(pkgDetails, id || filepath)) {
    if (process.platform == 'win32') id = id.replace(/\\/g, '/');
    // Cache
    cache.setFile({ path: filepath, id });
  }

  return id;
};