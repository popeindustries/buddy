'use strict';

const { VERSION_DELIMITER } = require('./config');
let fileCache = new Map();
let packageCache = new Map();
let versionedFileCache = new Map();

module.exports = {
  /**
   * Retrieve id or filepath for 'key'
   * @param {String} key
   * @returns {String}
   */
  getFile (key) {
    return fileCache.get(key);
  },

  /**
   * Add 'file' to cache
   * @param {Object} file
   *  - {String} id
   *  - {String} path
   *  - {String} version
   */
  setFile (file) {
    // Make sure not to overwrite
    if (file.path && file.id && !fileCache.has(file.path) && !fileCache.has(file.id)) {
      fileCache.set(file.path, file.id);
      fileCache.set(file.id, file.path);

      // Store in versioned cash to enable multiple version check
      const name = file.id.split(VERSION_DELIMITER)[0];

      if (!versionedFileCache.has(name)) {
        versionedFileCache.set(name, [file.version]);
      } else {
        versionedFileCache.get(name).push(file.version);
      }
    }
  },

  /**
   * Retrieve package details for 'key'
   * @param {String} key
   * @returns {Object}
   */
  getPackage (key) {
    return packageCache.get(key);
  },

  /**
   * Add 'pkg' to cache
   * @param {Object} pkg
   */
  setPackage (pkg) {
    // Make sure not to overwrite
    if (!packageCache.has(pkg.pkgpath) && !packageCache.has(pkg.id)) {
      packageCache.set(pkg.pkgpath, pkg);
      packageCache.set(pkg.id, pkg);
    }
  },

  /**
   * Determine if there is more than one file version of 'id'
   * @param {String} id
   * @returns {Boolean}
   */
  hasMultipleFileVersions (id) {
    const name = id.split(VERSION_DELIMITER)[0];

    return versionedFileCache.get(name).length > 1;
  },

  /**
   * Clear the cache
   */
  clear () {
    fileCache.clear();
    packageCache.clear();
    versionedFileCache.clear();
  }
};