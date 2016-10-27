'use strict';

const { VERSION_DELIMITER } = require('./config');
let fileCache = new Map();
let packageCache = new Map();
let versionedFileCache = new Map();
let versionedPackageCache = new Map();

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
   */
  setFile (file) {
    // Make sure not to overwrite
    if (file.path && file.id && !fileCache.has(file.path) && !fileCache.has(file.id)) {
      fileCache.set(file.path, file.id);
      fileCache.set(file.id, file.path);
      // Store in versioned cash to enable multiple version check
      if (file.id.includes(VERSION_DELIMITER)) {
        const name = file.id.split(VERSION_DELIMITER)[0];

        if (!versionedFileCache.has(name)) {
          versionedFileCache.set(name, 1);
        } else {
          versionedFileCache.set(name, versionedFileCache.get(name) + 1);
        }
      }
    }
  },

  /**
   * Retrieve package details for 'pkgpath'
   * @param {String} pkgpath
   * @returns {Object}
   */
  getPackage (pkgpath) {
    return packageCache.get(pkgpath);
  },

  /**
   * Add 'pkg' to cache
   * @param {Object} pkg
   */
  setPackage (pkg) {
    // Make sure not to overwrite
    if (!packageCache.has(pkg.pkgpath)) {
      packageCache.set(pkg.pkgpath, pkg);
      // Store in versioned cash to enable multiple version check
      if (!versionedPackageCache.has(pkg.id)) {
        versionedPackageCache.set(pkg.id, 1);
      } else {
        versionedPackageCache.set(pkg.id, versionedPackageCache.get(pkg.id) + 1);
      }
    }
  },

  /**
   * Determine if there is more than one file version of 'id'
   * @param {String} id
   * @returns {Boolean}
   */
  hasMultipleFileVersions (id) {
    if (id.includes(VERSION_DELIMITER)) {
      return versionedFileCache.get(id.split(VERSION_DELIMITER)[0]) > 1;
    }
    return false;
  },

  /**
   * Determine if there is more than one package version of 'id'
   * @param {String} id
   * @returns {Boolean}
   */
  hasMultiplePackageVersions (id) {
    return versionedPackageCache.get(id) > 1;
  },

  /**
   * Clear the cache
   */
  clear () {
    fileCache.clear();
    packageCache.clear();
    versionedFileCache.clear();
    versionedPackageCache.clear();
  }
};