'use strict';

const cache = require('./cache')
  , config = require('./config')
  , fs = require('fs')
  , pkg = require('./package')
  , path = require('path')
  , utils = require('./utils');

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
  options.type = utils.deriveType(sourcepath, options.fileExtensions);

  let filepath = find(id, path.dirname(sourcepath), options);

  // Implied relative path for css/html
  if (filepath == ''
    && options.type != 'js'
    && !utils.isRelativeFilepath(id)) {
      filepath = find('./' + id, path.dirname(sourcepath), options);
  }

  return filepath;
};

/**
 * Find filepath for 'id'
 * @param {String} id
 * @param {String} source
 * @param {Object} options
 * @returns {String}
 */
function find (id, source, options) {
  const pkgDetails = pkg.get(source, options);
  let filepath;

  // Resolve relative paths,
  if (utils.isRelativeFilepath(id)) id = path.resolve(source, id);

  // Redirect if cached version
  if (pkgDetails && !~source.indexOf(pkgDetails.pkgpath)) {
    // Replace source path root with pkgDetails root
    id = path.resolve(pkgDetails.dirname, path.relative(path.dirname(pkg.resolvePath(source)), source));
  }

  // Handle aliases
  if (pkgDetails && id in pkgDetails.aliases) id = pkgDetails.aliases[id];
  // Handle disabled or native modules
  if (id === false || ~options.nativeModules.indexOf(id)) return false;

  if (utils.isAbsoluteFilepath(id)) {
    filepath = utils.findFile(id, options.type, options.fileExtensions);
    if (pkgDetails && filepath in pkgDetails.aliases) filepath = pkgDetails.aliases[filepath];
    // File doesn't exist or is disabled
    if (filepath == '' || filepath === false) return filepath;
    // File found
    if (utils.isAbsoluteFilepath(filepath)) {
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

  // Search source paths for packages
  let fp, src;

  for (let i = 0, n = pkgDetails.paths.length; i < n; i++) {
    src = pkgDetails.paths[i];
    if (source != src) {
      fp = path.resolve(src, id);
      fp = find(fp, fp, options);
      if (fp != '') return fp;
    }
  }

  return '';
}