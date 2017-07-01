// @flow

'use strict';

type File = {
  id: string,
  path: string,
  version: string
};
type Package = {
  id: string,
  pkgpath: string
};

const { print, strong, warn } = require('../utils/cnsl');
const path = require('path');

module.exports = class ResolverCache {
  _fileCache: Map<string, string>;
  _packageCache: Map<string, Package>;
  _versionedFileCache: Map<string, Array<string>>;
  _warnedVersion: Set<string>;

  constructor() {
    this._fileCache = new Map();
    this._packageCache = new Map();
    this._versionedFileCache = new Map();
    this._warnedVersion = new Set();
  }

  /**
   * Retrieve id or filepath for 'key'
   */
  getFile(key: string): ?string {
    return this._fileCache.get(key);
  }

  /**
   * Retrieve file versions for 'id'
   */
  getFileVersions(id: string, versionDelimiter: string): ?Array<string> {
    const name = id.split(versionDelimiter)[0];

    return this._versionedFileCache.get(name);
  }

  /**
   * Add 'file' to cache
   */
  setFile(file: File, versionDelimiter: string) {
    // Make sure not to overwrite
    if (
      file.path != null &&
      file.id != null &&
      !this._fileCache.has(file.path) &&
      !this._fileCache.has(file.id)
    ) {
      this._fileCache.set(file.path, file.id);
      this._fileCache.set(file.id, file.path);

      // Store in versioned cash to enable multiple version check
      const name = file.id.split(versionDelimiter)[0];
      const versions = this._versionedFileCache.get(name);

      if (versions == null) {
        this._versionedFileCache.set(name, [file.version]);
      } else {
        if (!versions.includes(file.version)) {
          versions.push(file.version);
        }
      }
    }
  }

  /**
   * Retrieve package details for 'key'
   * @param {String} key
   * @returns {Object}
   */
  getPackage(key: string) {
    return this._packageCache.get(key);
  }

  /**
   * Add 'pkg' to cache
   */
  setPackage(pkg: Package) {
    // Make sure not to overwrite
    if (!this._packageCache.has(pkg.pkgpath) && !this._packageCache.has(pkg.id)) {
      this._packageCache.set(pkg.pkgpath, pkg);
      this._packageCache.set(pkg.id, pkg);
    }
  }

  /**
   * Warn of multiple versions for 'id'
   */
  checkMultipleVersions(id: string, filepath: string, versionDelimiter: string, level: number) {
    const [name, version] = id.split(versionDelimiter);
    const versions = this.getFileVersions(id, versionDelimiter) || [];
    const canonicalVersion = versions[0];
    const parts = name.split('/');
    // Handle scoped
    const pkg = parts.slice(0, parts[0].charAt(0) === '@' ? 2 : 1).join('/');

    if (versions.length <= 1 || version === canonicalVersion || this._warnedVersion.has(pkg)) {
      return;
    }

    warn(`multiple versions of the ${strong(pkg)} package will be bundled: ${strong(versions.join(', '))}`, level);

    if (filepath.indexOf('node_modules') !== filepath.lastIndexOf('node_modules')) {
      const sourceParts = path.relative(process.cwd(), filepath).replace(/\\/g, '/').split('/');
      const sourcePkg = sourceParts.slice(1, sourceParts[1].charAt(0) == '@' ? 3 : 2).join('/');

      print(
        `If possible, consider updating the ${strong(sourcePkg)} package to use version ${strong(canonicalVersion)}`,
        level
      );
    } else {
      print(`Consider updating ${strong('package.json')} to use version ${strong(canonicalVersion)}`, level);
    }

    this._warnedVersion.add(pkg);
  }

  /**
   * Clear the cache
   */
  clear() {
    this._fileCache.clear();
    this._packageCache.clear();
    this._versionedFileCache.clear();
    this._warnedVersion.clear();
  }
};
