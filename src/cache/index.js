// @flow

'use strict';

const { FSWatcher } = require('chokidar');
const debounce = require('lodash/debounce');
const Emitter = require('events');
const FileCache = require('./FileCache');
const ResolverCache = require('./ResolverCache');

const fileWatcher = new FSWatcher({
  ignored: /[\/\\]\./,
  persistent: true
});

module.exports = class Cache extends Emitter {
  fileCache: FileCache;
  resolverCache: ResolverCache;
  clear: () => void;
  _debouncedEmit: Function;

  constructor(watch: boolean) {
    super();

    this.fileCache = new FileCache(watch ? fileWatcher : undefined);
    this.resolverCache = new ResolverCache();

    this.clear = this.clear.bind(this);
    this._debouncedEmit = debounce(this.emit, 100, { trailing: true });
    if (watch) {
      fileWatcher.on('change', this.onWatchChange.bind(this));
      fileWatcher.on('unlink', this.onWatchDelete.bind(this));
      fileWatcher.on('error', this.onWatchError.bind(this));
    }
  }

  /**
   * Clear caches
   */
  clear() {
    this.fileCache.clear();
    this.resolverCache.clear();
    this.removeAllListeners();
  }

  /**
   * Handle changes to watched files
   */
  onWatchChange(filepath: string) {
    let changed = false;

    const file = this.fileCache.getFile(filepath);

    if (file) {
      changed = true;
      // Hard reset
      file.reset(true);
    }

    if (changed) {
      this._debouncedEmit('change', filepath);
    }
  }

  /**
   * Handle deleted watched files
   */
  onWatchDelete(filepath: string) {
    let changed = false;

    const file = this.fileCache.getFile(filepath);

    // Destroy
    if (file != null) {
      changed = true;
      file.destroy();
      this.fileCache.removeFile(file);
    }

    if (changed) {
      this._debouncedEmit('change', filepath);
    }
  }

  /**
   * Handle error watching files
   */
  onWatchError(err: Error) {
    this.emit('error', err);
  }
};
