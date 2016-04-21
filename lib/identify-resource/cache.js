'use strict';

const config = require('./config');
let packageCache = {}
  , versionedFileCache = {}
  , fileCache = {};

/**
 * Retrieve id or filepath for 'key'
 * @param {String} key
 * @returns {String}
 */
exports.getFile = function (key) {
  return fileCache[key];
};

/**
 * Add 'module' to cache
 * @param {Object} file
 */
exports.setFile = function (file) {
  // Make sure not to overwrite
  if (file.path && file.id && !fileCache[file.path] && !fileCache[file.id]) {
    fileCache[file.path] = file.id;
    fileCache[file.id] = file.path;
    // Store in versioned cash to enable multiple version check
    if (~file.id.indexOf(config.VERSION_DELIMITER)) {
      const name = file.id.split(config.VERSION_DELIMITER)[0];

      if (!versionedFileCache[name]) {
        versionedFileCache[name] = 1;
      } else {
        versionedFileCache[name]++;
      }
    }
  }
};

/**
 * Retrieve package details for 'key',
 * where 'key' is one of pakcage id or path
 * @param {String} key
 * @returns {Object}
 */
exports.getPackage = function (key) {
  return packageCache[key];
};

/**
 * Add 'pkg' to cache
 * @param {Object} pkg
 */
exports.setPackage = function (pkg) {
  // Make sure not to overwrite
  if (!packageCache[pkg.pkgpath] && !packageCache[pkg.id]) {
    packageCache[pkg.pkgpath] = pkg;
    packageCache[pkg.id] = pkg;
  }
};

/**
 * Determine if there is more than one version of 'id'
 * @param {String} id
 * @returns {Boolean}
 */
exports.hasMultipleVersions = function (id) {
  if (~id.indexOf(config.VERSION_DELIMITER)) {
    return versionedFileCache[id.split(config.VERSION_DELIMITER)[0]] > 1;
  }
  return false;
};

/**
 * Clear the cache
 */
exports.clear = function () {
  fileCache = {};
  packageCache = {};
  versionedFileCache = {};
};