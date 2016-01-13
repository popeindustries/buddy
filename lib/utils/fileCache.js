'use strict';

const EventEmitter = require('events').EventEmitter
  , path = require('path')
  , Watcher = require('yaw');

// Export
module.exports = function fileCacheFactory (watch) {
  return new FileCache(watch);
};

class FileCache extends EventEmitter {
  /**
   * Constructor
   * @param {Boolean} watch
   */
  constructor (watch) {
    super();

    this._cache = {};
    this._dirs = [];
    this.watching = watch;

    if (watch) {
      this.watcher = new Watcher();
      this.watcher.on('change', this.onWatchChange.bind(this));
      this.watcher.on('delete', this.onWatchDelete.bind(this));
      this.watcher.on('error', this.onWatchError.bind(this));
    }
  }

  /**
   * Store a 'file' in the cache
   * @param {File} file
   * @returns {File}
   */
  addFile (file) {
    if (!this._cache[file.filepath]) {
      const dir = path.dirname(file.filepath);

      this._cache[file.filepath] = file;
      if (!~this._dirs.indexOf(dir)) this._dirs.push(dir);
      if (this.watching) this.watcher.watch(file.filepath);
    }

    return file;
  }

  /**
   * Remove an file from the cache by it's 'filepath'
   * @param {Object} file
   * @returns {File}
   */
  removeFile (file) {
    delete this._cache[file.filepath];
    if (this.watching) this.watcher.unwatch(file.filepath);
    return file;
  }

  /**
   * Retrieve an item from the cache by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Object}
   */
  getFile (key) {
    return this._cache[key];
  }

  /**
   * Determine if the cache contains a file by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Boolean}
   */
  hasFile (key) {
    return this._cache[key] != null;
  }

  /**
   * Retrieve all file paths
   * @returns {Array}
   */
  getPaths () {
    return Object.keys(this._cache);
  }

  /**
   * Retrieve all unique directories
   * @returns {Array}
   */
  getDirs () {
    return this._dirs;
  }

  /**
   * Flush the cache
   */
  flush () {
    if (this.watching) this.watcher.clean();
    this._cache = {};
    this._dirs = [];
  }

  /**
   * Handle changes to watched files
   * @param {String} filepath
   * @param {Stats} stats
   */
  onWatchChange (filepath, stats) {
    const file = this._cache[filepath];

    // Reset file
    if (file) {
      // Hard reset
      file.reset(true);
      this.emit('change', file);
    }
  }

  /**
   * Handle deleted watched files
   * @param {String} filepath
   */
  onWatchDelete (filepath) {
    const file = this._cache[filepath];

    // Destroy file
    if (file) {
      file.destroy();
      this.removeFile(file);
    }
  }

  /**
   * Handle error watching files
   * @param {Error} err
   */
  onWatchError (err) {
    this.emit('error', err);
  }
}