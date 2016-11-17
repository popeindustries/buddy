'use strict';

const { FSWatcher } = require('chokidar');
const Emitter = require('events');
const FileCache = require('./FileCache');
const resolverCache = require('./resolverCache');

class Cache extends Emitter {
  constructor () {
    super();

    this.resolverCache = resolverCache;
    this.fileCaches = new Set();
    this._fileWatcher = new FSWatcher({
      ignored: /[\/\\]\./,
      persistent: true
    });

    this._fileWatcher.on('change', this.onWatchChange.bind(this));
    this._fileWatcher.on('unlink', this.onWatchDelete.bind(this));
    this._fileWatcher.on('error', this.onWatchError.bind(this));
  }

  /**
   * FileCache instance factory
   * @param {Boolean} watch
   * @returns {FileCache}
   */
  createFileCache (watch) {
    const fileCache = new FileCache(watch && this._fileWatcher);

    this.fileCaches.add(fileCache);

    return fileCache;
  }

  /**
   * Clear all caches
   */
  clear () {
    this.resolverCache.clear();
    for (const fileCache of this.fileCaches) {
      fileCache.clear();
    }
    this.fileCaches.clear();
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