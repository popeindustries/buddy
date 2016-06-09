'use strict';

const cache = require('./cache');
const config = require('./config');
const fs = require('fs');
const pkg = require('./package');
const path = require('path');
const utils = require('./utils');

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

  let filepath = '';

  // Implied relative path for css/html
  if (options.type != 'js' && !utils.isRelativeFilepath(id)) {
    filepath = find(`./${id}`, path.dirname(sourcepath), options);
  }

  if (!filepath) filepath = find(id, path.dirname(sourcepath), options);

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
  const details = pkg.get(source, options);
  let filepath;

  // Resolve relative paths,
  if (utils.isRelativeFilepath(id)) id = path.resolve(source, id);

  // Redirect if cached version
  if (details && !~source.indexOf(details.pkgpath)) {
    // Replace source path root with details root
    id = path.resolve(details.dirname, path.relative(path.dirname(pkg.resolvePath(source)), source));
  }

  // Handle aliases
  if (details && id in details.aliases) id = details.aliases[id];
  // Handle root package shortcut id
  if (details && details.isRoot && details.id == id) return details.main;
  // Handle disabled or native modules
  if (id === false || ~options.nativeModules.indexOf(id)) return false;

  if (utils.isAbsoluteFilepath(id)) {
    filepath = utils.findFile(id, options.type, options.fileExtensions);
    if (details && filepath in details.aliases) filepath = details.aliases[filepath];
    // File doesn't exist or is disabled
    if (filepath == '' || filepath === false) return filepath;
    // File found
    if (utils.isAbsoluteFilepath(filepath)) {
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

    if (id && source != src) {
      fp = path.resolve(src, id);
      fp = find(fp, fp, options);
      if (fp != '') return fp;
    }
  }

  return '';
}