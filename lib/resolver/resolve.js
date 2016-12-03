'use strict';

const { filepathType, isAbsoluteFilepath, isFilepath, isRelativeFilepath, findFilepath } = require('../utils/filepath');
const alias = require('./alias');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');
const path = require('path');

/**
 * Resolve the path for 'id' from 'sourcepath'
 * @param {String} sourcepath
 * @param {String} id
 * @param {Object} [options]
 *  - {Boolean} browser
 *  - {ResolverCache} cache
 *  - {Object} fileExtensions
 *  - {Array} nativeModules
 *  - {Array} sources
 * @returns {String|Boolean}
 */
module.exports = function resolve (sourcepath, id, options) {
  if (!fs.existsSync(sourcepath)) return '';

  options = config(options);

  const { fileExtensions } = options;
  const type = filepathType(sourcepath, fileExtensions);
  const sourcedir = path.dirname(sourcepath);
  let filepath = '';

  // Implied relative path for css/html
  if (type != 'js' && !isRelativeFilepath(id)) {
    filepath = find(`./${id}`, type, sourcedir, options);
  }

  if (filepath === '') filepath = find(id, type, sourcedir, options);

  return filepath === undefined ? '' : filepath;
};

/**
 * Find filepath for 'id' in 'sourcedir' directory
 * @param {String} id
 * @param {String} type
 * @param {String} sourcedir
 * @param {Object} options
 *  - {Boolean} browser
 *  - {ResolverCache} cache
 *  - {Object} fileExtensions
 *  - {Array} nativeModules
 *  - {Array} sources
 * @returns {String|Boolean}
 */
function find (id, type, sourcedir, options) {
  const { cache, fileExtensions, nativeModules } = options;
  const pkgDetails = pkg.getDetails(sourcedir, options);
  let filepath = isRelativeFilepath(id) ? path.join(sourcedir, id) : id;

  filepath = alias.resolve(filepath, pkgDetails && pkgDetails.aliases);
  if (filepath === false || nativeModules.includes(filepath)) return false;

  if (isAbsoluteFilepath(filepath)) {
    filepath = findFilepath(filepath, type, fileExtensions);
    filepath = alias.resolve(filepath, pkgDetails && pkgDetails.aliases);
    // File doesn't exist or is disabled
    if (filepath === '' || filepath === false) return filepath;
    // File found
    if (isAbsoluteFilepath(filepath)) {
      // Cache
      cache.setFile({
        id: pkg.resolveId(pkgDetails, filepath),
        path: filepath,
        version: pkgDetails.version
      }, config.VERSION_DELIMITER);

      return filepath;
    }
  }

  // Update id if it has been resolved as package
  if (!isFilepath(filepath)) id = filepath;

  // Search paths for matches
  pkgDetails.paths.some((sourcepath) => {
    if (id && sourcedir != sourcepath) {
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