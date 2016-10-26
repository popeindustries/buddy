'use strict';

const { deriveType, isAbsoluteFilepath, isRelativeFilepath, findFile } = require('./utils');
const alias = require('./alias');
const cache = require('./cache');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');
const path = require('path');

/**
 * Resolve the path for 'id' from 'sourcepath'
 * @param {String} sourcepath
 * @param {String} id
 * @param {Object} [options]
 *  - {Object} fileExtensions
 *  - {Object} globalAliases
 * @returns {String|Boolean}
 */
module.exports = function resolve (sourcepath, id, options) {
  if (!fs.existsSync(sourcepath)) return '';

  options = config(options);

  const type = deriveType(sourcepath, options.fileExtensions);
  const sourcedir = path.dirname(sourcepath);
  let filepath = '';

  // Implied relative path for css/html
  if (type != 'js' && !isRelativeFilepath(id)) {
    filepath = find(`./${id}`, type, sourcedir, options);
  }

  if (filepath === '') filepath = find(id, type, sourcedir, options);

  return filepath;
};

/**
 * Find filepath for 'id' in 'sourcedir' directory
 * @param {String} id
 * @param {String} type
 * @param {String} sourcedir
 * @param {Object} options
 *  - {Object} fileExtensions
 *  - {Array} nativeModules
 *  - {Array} sources
 * @returns {String|Boolean}
 */
function find (id, type, sourcedir, options) {
  const pkgDetails = pkg.getDetails(sourcedir, options);
  let filepath;

  // Resolve relative paths,
  if (isRelativeFilepath(id)) id = path.resolve(sourcedir, id);

  // Redirect if cached version
  if (pkgDetails && !~sourcedir.indexOf(pkgDetails.pkgpath)) {
    // Replace source path root with details root
    id = path.resolve(pkgDetails.dirname, path.relative(path.dirname(pkg.resolvePath(sourcedir)), sourcedir));
  }

  // Handle aliases
  id = alias.resolve(pkgDetails, id);
  // Handle root package shortcut id
  if (pkgDetails && pkgDetails.isRoot && pkgDetails.id == id) return pkgDetails.main;
  // Handle disabled or native modules
  if (id === false || options.nativeModules.includes(id)) return false;

  if (isAbsoluteFilepath(id)) {
    filepath = findFile(id, type, options.fileExtensions);
    filepath = alias.resolve(pkgDetails, filepath);
    // File doesn't exist or is disabled
    if (filepath == '' || filepath === false) return filepath;
    // File found
    if (isAbsoluteFilepath(filepath)) {
      // Cache
      cache.setFile({
        path: filepath,
        id: pkg.resolveId(pkgDetails, filepath)
      });

      return filepath;
    }

    // Continue
    id = filepath;
  }

  // Search source paths for matches
  let fp;

  pkgDetails.paths.some((sourcepath) => {
    if (id && sourcedir != sourcepath) {
      fp = path.resolve(sourcepath, id);
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