// @flow

'use strict';

const { isAbsoluteFilepath } = require('../utils/filepath');
const { isInvalid } = require('../utils/is');
const { versionDelimiter } = require('../settings');
const config = require('./config');
const pkg = require('./package');

/**
 * Retrieve id for 'filepath'
 */
module.exports = function identify(filepath: string, options: Object): string {
  options = config(options);

  const { cache } = options;
  let id = '';

  if (!isAbsoluteFilepath(filepath)) {
    return id;
  }

  // Return from cache
  if (!isInvalid(id = cache.getFile(filepath))) {
    return id;
  }

  const pkgDetails = pkg.getDetails(filepath, options);

  if (!isInvalid(id = pkg.resolveId(pkgDetails, filepath))) {
    // Cache
    cache.setFile({ id, path: filepath, version: pkgDetails.version }, versionDelimiter);
  }

  return id;
};
