'use strict';

const { deriveType, isAbsoluteFilepath, isRelativeFilepath, findFile } = require('./utils');
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
 * @returns {String}
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

  if (!filepath) filepath = find(id, type, sourcedir, options);

  return filepath;
};

/**
 * Find filepath for 'id' in 'sourcedir' directory
 * @param {String} id
 * @param {String} type
 * @param {String} sourcedir
 * @param {Object} options
 * @returns {String}
 */
function find (id, type, sourcedir, options) {
  const details = pkg.getDetails(sourcedir, options);
  let filepath;

  // Resolve relative paths,
  if (isRelativeFilepath(id)) id = path.resolve(sourcedir, id);

  // Redirect if cached version
  if (details && !~sourcedir.indexOf(details.pkgpath)) {
    // Replace source path root with details root
    id = path.resolve(details.dirname, path.relative(path.dirname(pkg.resolvePath(sourcedir)), sourcedir));
  }

  // Handle aliases
  if (details && id in details.aliases) id = details.aliases[id];
  // Handle root package shortcut id
  if (details && details.isRoot && details.id == id) return details.main;
  // Handle disabled or native modules
  if (id === false || ~options.nativeModules.indexOf(id)) return false;

  if (isAbsoluteFilepath(id)) {
    filepath = findFile(id, type, options.fileExtensions);
    if (details && filepath in details.aliases) filepath = details.aliases[filepath];
    // File doesn't exist or is disabled
    if (filepath == '' || filepath === false) return filepath;
    // File found
    if (isAbsoluteFilepath(filepath)) {
      // Cache
      cache.setFile({
        path: filepath,
        id: pkg.resolveId(details, filepath)
      });

      return filepath;
    }

    // Continue
    id = filepath;
  }

  // Search source paths for matches
  let fp;

  for (let i = details.paths.length - 1; i >= 0; i--) {
    const src = details.paths[i];

    if (id && sourcedir != src) {
      fp = path.resolve(src, id);
      fp = find(fp, type, fp, options);
      if (fp != '') return fp;
    }
  }

  return '';
}