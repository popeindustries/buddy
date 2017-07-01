// @flow

'use strict';

type Caches = {
  fileCache: FileCache,
  resolverCache: ResolverCache
};

const { FSWatcher } = require('chokidar');
const debounce = require('lodash/debounce');
const Emitter = require('events');
const FileCache = require('./FileCache');
const ResolverCache = require('./ResolverCache');

class Cache extends Emitter {
  fileCaches: Set<>;
  resolverCaches: Set<>;
  createCaches: boolean => Caches;
  clear: () => void;
  debouncedEmit: (type: string, ...args?: Array<any>) => void;
  _fileWatcher: FSWatcher;

  constructor() {
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
    this.debouncedEmit = debounce(this.emit, 100, { trailing: true });
  }

  /**
   * FileCache/ResolverCache instance factory
   */
  createCaches(watch: boolean): Caches {
    const fileCache = new FileCache(watch && this._fileWatcher);
    const resolverCache = new ResolverCache();

    this.fileCaches.add(fileCache);
    this.resolverCaches.add(resolverCache);

    return { fileCache, resolverCache };
  }

  /**
   * Clear all caches
   */
  clear() {
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
   */
  onWatchChange(filepath: string) {
    let changed = false;

    for (const fileCache of this.fileCaches) {
      const file = fileCache.getFile(filepath);

      if (file) {
        changed = true;
        // Hard reset
        file.reset(true);
      }
    }

    if (changed) {
      this.debouncedEmit('change', filepath);
    }
  }

  /**
   * Handle deleted watched files
   */
  onWatchDelete(filepath: string) {
    let changed = false;

    for (const fileCache of this.fileCaches) {
      const file = fileCache.getFile(filepath);

      // Destroy
      if (file != null) {
        changed = true;
        file.destroy();
        fileCache.removeFile(file);
      }
    }

    if (changed) {
      this.debouncedEmit('change', filepath);
    }
  }

  /**
   * Handle error watching files
   */
  onWatchError(err: Error) {
    this.emit('error', err);
  }
}

module.exports = new Cache();
