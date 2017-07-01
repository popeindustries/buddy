// @flow

'use strict';

const { filepathType, isAbsoluteFilepath, isFilepath, isRelativeFilepath, findFilepath } = require('../utils/filepath');
const { isInvalid, isUndefined } = require('../utils/is');
const { versionDelimiter } = require('../settings');
const alias = require('./alias');
const config = require('./config');
const pkg = require('./package');
const path = require('path');

/**
 * Resolve the path for 'id' from 'sourcepath'
 */
module.exports = function resolve(sourcepath: string, id: string, options: Object): string | boolean {
  options = config(options);

  const { fileExtensions } = options;
  const type = filepathType(sourcepath, fileExtensions);
  const sourcedir = path.dirname(sourcepath);
  let filepath = '';

  // Implied relative path for css/html
  if (type !== 'js' && !isRelativeFilepath(id)) {
    filepath = find(`./${id}`, type, sourcedir, options);
  }

  if (filepath === '') {
    filepath = find(id, type, sourcedir, options);
  }

  return isUndefined(filepath) ? '' : filepath;
};

/**
 * Find filepath for 'id' in 'sourcedir' directory
 */
function find(id: string, type: string, sourcedir: string, options: Object): string | boolean {
  const { cache, fileExtensions, nativeModules } = options;
  const pkgDetails = pkg.getDetails(sourcedir, options);
  let filepath = isRelativeFilepath(id) ? path.join(sourcedir, id) : id;

  filepath = alias.resolve(filepath, pkgDetails && pkgDetails.aliases);
  if (filepath === false || nativeModules.includes(filepath)) {
    return false;
  }

  if (isAbsoluteFilepath(filepath)) {
    filepath = findFilepath(filepath, type, fileExtensions);
    filepath = alias.resolve(filepath, pkgDetails && pkgDetails.aliases);
    // File doesn't exist or is disabled
    if (filepath === '' || filepath === false) {
      return filepath;
    }
    // File found
    if (isAbsoluteFilepath(filepath)) {
      // Cache
      cache.setFile(
        {
          id: pkg.resolveId(pkgDetails, filepath),
          path: filepath,
          version: pkgDetails.version
        },
        versionDelimiter
      );

      return filepath;
    }
  }

  // Update id if it has been resolved as package
  if (!isFilepath(filepath)) {
    id = filepath;
  }

  // Search paths for matches
  pkgDetails.paths.some(sourcepath => {
    if (!isInvalid(id) && sourcedir !== sourcepath) {
      let fp = path.join(sourcepath, id);

      fp = find(fp, type, fp, options);
      if (fp !== '') {
        filepath = fp;
        return true;
      }
      filepath = '';
    }
  });

  return filepath;
}
