'use strict';

const path = require('path');

module.exports = class FileCache {
  /**
   * Constructor
   * @param {FileWatcher} [watcher]
   */
  constructor (watcher) {
    this._cache = new Map();
    this._dirs = new Set();
    if (watcher) this.watcher = watcher;
  }

  /**
   * Store a 'file' in the cache
   * @param {File} file
   * @returns {File}
   */
  addFile (file) {
    if (!this._cache.has(file.filepath)) {
      const dir = path.dirname(file.filepath);

      this._cache.set(file.filepath, file);
      if (!this._dirs.has(dir)) this._dirs.add(dir);
      if (this.watcher) this.watcher.add(file.filepath);
    }

    return file;
  }

  /**
   * Remove a file from the cache by it's 'filepath'
   * @param {Object} file
   * @returns {File}
   */
  removeFile (file) {
    this._cache.delete(file.filepath);
    if (this.watcher) this.watcher.unwatch(file.filepath);
    return file;
  }

  /**
   * Retrieve a file from the cache by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Object}
   */
  getFile (key) {
    return this._cache.get(key);
  }

  /**
   * Determine if the cache contains a file by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Boolean}
   */
  hasFile (key) {
    return this._cache.has(key);
  }

  /**
   * Retrieve all file paths
   * @returns {Array}
   */
  getPaths () {
    return this._cache.keys();
  }

  /**
   * Retrieve all unique directories
   * @returns {Array}
   */
  getDirs () {
    return [...this._dirs];
  }

  /**
   * Clear the cache
   */
  clear () {
    if (this.watcher) {
      for (const filepath of this._cache.keys()) {
        this.watcher.unwatch(filepath);
      }
    }
    this._cache.clear();
    this._dirs.clear();
  }
};