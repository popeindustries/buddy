'use strict';

const { FSWatcher } = require('chokidar');
const Emitter = require('events');
const FileCache = require('./FileCache');
const ResolverCache = require('./ResolverCache');

class Cache extends Emitter {
  constructor () {
    super();

    this.fileCaches = new Set();
    this.resolverCaches = new Set();
    this._fileWatcher = new FSWatcher({
      ignored: /[\/\\]\./,
      persistent: true
    });

    this._fileWatcher.on('change', this.onWatchChange.bind(this));
    this._fileWatcher.on('unlink', this.onWatchDelete.bind(this));
    this._fileWatcher.on('error', this.onWatchError.bind(this));
    this.createCaches = this.createCaches.bind(this);
    this.clear = this.clear.bind(this);
  }

  /**
   * FileCache/ResolverCache instance factory
   * @param {Boolean} watch
   * @returns {Object}
   */
  createCaches (watch) {
    const fileCache = new FileCache(watch && this._fileWatcher);
    const resolverCache = new ResolverCache();

    this.fileCaches.add(fileCache);
    this.resolverCaches.add(resolverCache);

    return { fileCache, resolverCache };
  }

  /**
   * Clear all caches
   */
  clear () {
    for (const fileCache of this.fileCaches) {
      fileCache.clear();
    }
    for (const resolverCache of this.resolverCaches) {
      resolverCache.clear();
    }
    this.fileCaches.clear();
    this.resolverCaches.clear();
    this.removeAllListeners();
  }

  /**
   * Handle changes to watched files
   * @param {String} filepath
   */
  onWatchChange (filepath) {
    let changed = false;

    for (const fileCache of this.fileCaches) {
      const file = fileCache.getFile(filepath);

      if (file) {
        changed = true;
        // Hard reset
        file.reset(true);
      }
    }

    if (changed) this.emit('change', filepath);
  }

  /**
   * Handle deleted watched files
   * @param {String} filepath
   */
  onWatchDelete (filepath) {
    let changed = false;

    for (const fileCache of this.fileCaches) {
      const file = fileCache.getFile(filepath);

      // Destroy
      if (file) {
        changed = true;
        file.destroy();
        fileCache.removeFile(file);
      }
    }

    if (changed) this.emit('change', filepath);
  }

  /**
   * Handle error watching files
   * @param {Error} err
   */
  onWatchError (err) {
    this.emit('error', err);
  }
}

module.exports = new Cache();