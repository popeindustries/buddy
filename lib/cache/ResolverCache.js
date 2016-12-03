'use strict';

module.exports = class ResolverCache {
  /**
   * Constructor
   * @param {FileWatcher} [watcher]
   */
  constructor (watcher) {
    this._fileCache = new Map();
    this._packageCache = new Map();
    this._versionedFileCache = new Map();
  }

  /**
   * Retrieve id or filepath for 'key'
   * @param {String} key
   * @returns {String}
   */
  getFile (key) {
    return this._fileCache.get(key);
  }

  /**
   * Retrieve file versions for 'id'
   * @param {String} id
   * @param {String} versionDelimiter
   * @returns {Array}
   */
  getFileVersions (id, versionDelimiter) {
    const name = id.split(versionDelimiter)[0];

    return this._versionedFileCache.get(name);
  }

  /**
   * Add 'file' to cache
   * @param {Object} file
   *  - {String} id
   *  - {String} path
   *  - {String} version
   * @param {String} versionDelimiter
   */
  setFile (file, versionDelimiter) {
    // Make sure not to overwrite
    if (file.path && file.id && !this._fileCache.has(file.path) && !this._fileCache.has(file.id)) {
      this._fileCache.set(file.path, file.id);
      this._fileCache.set(file.id, file.path);

      // Store in versioned cash to enable multiple version check
      const name = file.id.split(versionDelimiter)[0];

      if (!this._versionedFileCache.has(name)) {
        this._versionedFileCache.set(name, [file.version]);
      } else {
        this._versionedFileCache.get(name).push(file.version);
      }
    }
  }

  /**
   * Retrieve package details for 'key'
   * @param {String} key
   * @returns {Object}
   */
  getPackage (key) {
    return this._packageCache.get(key);
  }

  /**
   * Add 'pkg' to cache
   * @param {Object} pkg
   */
  setPackage (pkg) {
    // Make sure not to overwrite
    if (!this._packageCache.has(pkg.pkgpath) && !this._packageCache.has(pkg.id)) {
      this._packageCache.set(pkg.pkgpath, pkg);
      this._packageCache.set(pkg.id, pkg);
    }
  }

  /**
   * Clear the cache
   */
  clear () {
    this._fileCache.clear();
    this._packageCache.clear();
    this._versionedFileCache.clear();
  }
};