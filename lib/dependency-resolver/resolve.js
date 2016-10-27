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
  let filepath = path.resolve(sourcedir, id);

  console.log('+++++++++++++++++++++')
  console.log(id, sourcedir)
  console.log(pkgDetails)
  // Resolve relative paths,
  // if (isRelativeFilepath(id)) id = path.resolve(sourcedir, id);

  // Redirect if cached version
  // if (pkgDetails && !sourcedir.includes(pkgDetails.pkgpath)) {
  //   // Replace source path root with details root
  //   id = path.resolve(pkgDetails.dirname, path.relative(path.dirname(pkg.resolvePath(sourcedir)), sourcedir));
  // }

  // Handle aliases
  id = alias.resolve(id, pkgDetails && pkgDetails.aliases);
  // Handle disabled or native modules
  if (id === false || options.nativeModules.includes(id)) return false;
  console.log(id)

  if (isAbsoluteFilepath(id)) {
    filepath = findFile(id, type, options.fileExtensions);
    filepath = alias.resolve(filepath, pkgDetails && pkgDetails.aliases);
    // File doesn't exist or is disabled
    if (filepath === '' || filepath === false) return filepath;
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
    // id = filepath;
  }

  // Search source paths for matches
  pkgDetails.paths.some((sourcepath) => {
    if (sourcedir != sourcepath) {
      filepath = find(id, type, sourcepath, options);
      return filepath;
    }
  });

  return filepath;
}