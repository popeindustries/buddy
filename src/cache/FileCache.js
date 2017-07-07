//  @flow

'use strict';

import type { FSWatcher } from 'chokidar';
import type File from '../File';

const path = require('path');

module.exports = class FileCache {
  watcher: FSWatcher;
  _cache: Map<string, File>;
  _dirs: Set<string>;

  constructor(watcher?: FSWatcher) {
    this._cache = new Map();
    this._dirs = new Set();
    if (watcher !== undefined) {
      this.watcher = watcher;
    }
  }

  /**
   * Store a 'file' in the cache
   */
  addFile(file: File): File {
    if (!this._cache.has(file.filepath)) {
      const dir = path.dirname(file.filepath);

      this._cache.set(file.filepath, file);
      if (!this._dirs.has(dir)) {
        this._dirs.add(dir);
      }
      if (this.watcher !== undefined) {
        this.watcher.add(file.filepath);
      }
    }

    return file;
  }

  /**
   * Remove a file from the cache by it's 'filepath'
   */
  removeFile(file: File): File {
    this._cache.delete(file.filepath);
    if (this.watcher !== undefined) {
      this.watcher.unwatch(file.filepath);
    }
    return file;
  }

  /**
   * Retrieve a file from the cache by 'key' (filepath or type:id)
   */
  getFile(key: string): ?File {
    return this._cache.get(key);
  }

  /**
   * Determine if the cache contains a file by 'key' (filepath or type:id)
   */
  hasFile(key: string): boolean {
    return this._cache.has(key);
  }

  /**
   * Retrieve all file paths
   */
  getPaths(): Array<string> {
    return Array.from(this._cache.keys());
  }

  /**
   * Retrieve all unique directories
   */
  getDirs(): Array<string> {
    return Array.from(this._dirs);
  }

  /**
   * Clear the cache
   */
  clear() {
    if (this.watcher !== undefined) {
      for (const filepath of this._cache.keys()) {
        this.watcher.unwatch(filepath);
      }
    }
    this._cache.clear();
    this._dirs.clear();
  }
};
