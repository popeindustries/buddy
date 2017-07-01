// @flow

'use strict';

type Package = {
  aliases: { [string]: string },
  dirname: string,
  id: string,
  isNestedProjectPackage: boolean,
  isNpmPackage: boolean,
  manifestpath: string,
  main: string,
  name: string,
  paths: Array<string>,
  pkgpath: string,
  version: string
};

const { exists, filepathType, findFilepath, isFilepath } = require('../utils/filepath');
const { isInvalid } = require('../utils/is');
const { maxFileSystemDepth, versionDelimiter } = require('../settings');
const alias = require('./alias');
const path = require('path');

const RE_TRAILING = /\/+$|\\+$/g;

module.exports = {
  getDetails,
  resolveId,
  resolveName,
  resolvePath
};

/**
 * Retrieve package details for 'filepath'
 */
function getDetails(filepath: string, options: Object): Package {
  options = Object.assign({ sources: [] }, options);

  const { browser, cache, fileExtensions, sources } = options;
  const cwd = process.cwd();
  const pkgpath = resolvePath(filepath);
  let details;

  // Pull from cache
  if (!isInvalid((details = cache.getPackage(pkgpath)))) {
    return details;
  }

  const pkgname = resolveName(pkgpath);
  // Gather all reachable paths
  const paths = [...resolveNodeModules(pkgpath), ...sources];
  const type = filepathType(filepath, fileExtensions) || 'js';
  let manifestpath = path.resolve(pkgpath, 'package.json');
  const isRoot = path.dirname(manifestpath) === cwd;
  let isNestedProjectPackage = false;

  // Default to root manifest for nested (proxy) packages
  if (!pkgpath.includes('node_modules') && !exists(manifestpath)) {
    manifestpath = path.resolve(cwd, 'package.json');
    isNestedProjectPackage = true;
  }

  details = {
    aliases: {},
    dirname: path.dirname(pkgpath),
    id: pkgname,
    isNestedProjectPackage,
    isNpmPackage: !isRoot && !isNestedProjectPackage,
    manifestpath: '',
    main: '',
    name: pkgname,
    paths,
    pkgpath,
    version: '1.0.0'
  };

  // Parse manifest
  let json;

  try {
    json = require(manifestpath);
  } catch (err) {
    /* not found  */
  }

  if (json) {
    const manifestRoot = path.dirname(manifestpath);

    details.manifestpath = manifestpath;
    details.name = details.id = json.name || pkgname;
    details.version = json.version;
    details.main = findFilepath(path.join(manifestRoot, json.main || 'index.js'), type, fileExtensions);
    // Resolve json.browser aliasing
    if (!isInvalid(json.browser) && browser) {
      if (typeof json.browser === 'string') {
        details.main = path.join(manifestRoot, json.browser);
      } else {
        details.aliases = Object.assign(details.aliases, alias.parse(manifestRoot, json.browser, type, fileExtensions));
        // Handle 'main' aliasing
        for (const key in details.aliases) {
          if (key === details.main) {
            details.main = details.aliases[key];
          }
        }
      }
    }
    // Store main as alias
    if (!isInvalid(details.main)) {
      details.aliases[manifestRoot] = details.main;
      details.aliases[details.id] = details.main;
    }
    // Reset if nested
    if (isNestedProjectPackage) {
      details.main = details.manifestpath = details.version = '';
      details.name = details.id = details.name + pkgname.slice(pkgname.indexOf(path.sep));
    }
  }

  // Handle scoped
  if (path.basename(details.dirname).indexOf('@') === 0) {
    details.dirname = path.dirname(details.dirname);
  }
  // Append version number if multiple versions exist
  if (cache.getPackage(details.id) != null) {
    details.id += versionDelimiter + details.version;
  }

  // Cache
  cache.setPackage(details);

  return details;
}

/**
 * Resolve package path from 'filepath'
 */
function resolvePath(filepath: string): string {
  filepath = filepath.replace(RE_TRAILING, '');
  const cwd = process.cwd();

  // Find nearest node_modules directory
  if (filepath.includes('node_modules')) {
    const parts = filepath.split(path.sep);
    let idx = parts.lastIndexOf('node_modules');

    if (idx < parts.length - 1) {
      idx += 2;
    }
    // Handle scoped
    if (parts[idx - 1].charAt(0) === '@') {
      idx++;
    }

    const dir = parts.slice(0, idx).join(path.sep);

    // Installed packages must have manifest, otherwise continue
    if (exists(path.join(dir, 'package.json'))) {
      return dir;
    }
  }

  // Find nearest directory with node_modules subdirectory
  if (filepath.includes(cwd)) {
    let depth = maxFileSystemDepth;
    let dir = filepath;
    let parent = '';

    while (true) {
      parent = path.dirname(dir);
      // Stop if we hit max file system depth or root
      // Convert to lowercase to fix problems on Windows
      if (--depth === 0 || parent.toLowerCase() === dir.toLowerCase()) {
        break;
      }

      // Stop at nearest directory with node_modules or cwd
      if (dir === cwd || exists(path.resolve(dir, 'node_modules'))) {
        return dir;
      }

      // Walk
      dir = parent;
    }
  }

  // Return project directory if file isn't a project file
  return cwd;
}

/**
 * Resolve package name from 'pkgpath'
 */
function resolveName(pkgpath: string): string {
  pkgpath = pkgpath.replace(RE_TRAILING, '');

  const cwd = process.cwd();
  const parts = pkgpath.split(path.sep);
  const len = parts.length;

  let idx = 1;

  // Handle packages nested under root
  if (!pkgpath.includes('node_modules') && cwd !== pkgpath) {
    // Increase by distance from root
    idx += path.relative(cwd, pkgpath).split(path.sep).length;
    // Handle scoped node_modules
  } else if (parts[len - 2].charAt(0) === '@') {
    idx = 2;
  }

  return parts.slice(len - idx).join(path.sep);
}

/**
 * Resolve id for 'filepath'
 * @param {Object} details
 * @param {String} filepath
 * @returns {String}
 */
function resolveId(details: Package, filepath: string): string {
  let id = '';

  if (typeof filepath === 'string') {
    // Only version if more than one package
    const version = details.id.includes(versionDelimiter) ? versionDelimiter + details.version : '';
    const versioned = (id, stripExtension) => {
      // Strip extension
      if (stripExtension) {
        id = id.replace(path.extname(id), '');
      }
      return (process.platform === 'win32' ? id.replace(/\\/g, '/') : id) + version;
    };

    // Resolve aliases
    id = alias.resolve(filepath, details.aliases);
    // Ignore disabled (false)
    if (typeof id !== 'string') {
      id = filepath;
    }
    // Return if resolved id
    if (!isFilepath(id)) {
      return versioned(id, false);
    }
    // Resolve alias to id (also handles main => id)
    id = alias.resolveReverse(id, details.aliases);
    // Return if resolved id
    if (!isFilepath(id)) {
      return versioned(id, false);
    }

    // Resolve ids from project root if nested project package
    const pkgpath = details.isNestedProjectPackage
      ? process.cwd()
      : // Resolve ids from node_modules root if npm package
        details.isNpmPackage ? details.dirname : details.pkgpath;

    [...details.paths, pkgpath].some(sourcepath => {
      if (filepath.includes(sourcepath)) {
        id = path.relative(sourcepath, filepath);
        return true;
      }
    });

    return versioned(id, true);
  }

  return id;
}

/**
 * Gather all node_modules directories reachable from 'pkgpath'
 * @param {String} pkgpath
 * @returns {Array}
 */
function resolveNodeModules(pkgpath: string): Array<string> {
  const dirs = [];
  let dir = pkgpath;
  let depth = maxFileSystemDepth;
  let parent;
  let nodeModulespath;

  while (true) {
    parent = path.dirname(dir);
    // Stop if we hit max file system depth or root
    // Convert to lowercase to fix problems on Windows
    if (--depth === 0 || parent.toLowerCase() === dir.toLowerCase()) {
      break;
    }

    nodeModulespath = path.resolve(dir, 'node_modules');

    if (exists(nodeModulespath)) {
      dirs.push(nodeModulespath);
    }

    // Walk
    dir = parent;
  }

  return dirs;
}
