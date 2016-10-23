'use strict';

const { VERSION_DELIMITER } = require('./config');
const alias = require('./alias');
const cache = require('./cache');
const fs = require('fs');
const path = require('path');

const MAX_FS_DEPTH = 10;
const RE_TRAILING = /\/+$|\\+$/g;

module.exports = {
  resolveId,
  resolveName,
  resolvePath,

  /**
   * Retrieve package details for 'filepath'
   * @param {String} filepath
   * @param {Object} options
   *  - {Object} fileExtensions
   *  - {Object} globalAliases
   *  - {Array} globalSources
   *  - {Array} nativeModules
   *  - {Array} sources
   * @returns {Object}
   */
  getDetails (filepath, options) {
    options = options || {};

    const cwd = process.cwd();
    const pkgpath = resolvePath(filepath);
    const pkgname = resolveName(pkgpath);
    const manifestpath = path.resolve(pkgpath, 'package.json');
    let details, existingPkg, json;

    if (!fs.existsSync(pkgpath)) return;

    // Pull from cache
    if (details = cache.getPackage(pkgpath)) return details;

    details = {
      aliases: Object.assign({}, options.globalAliases),
      dirname: path.dirname(pkgpath),
      id: '',
      isRoot: pkgpath == cwd,
      manifestpath: '',
      main: '',
      name: pkgname,
      paths: [],
      pkgpath: pkgpath,
      version: ''
    };

    // Parse manifest
    if (fs.existsSync(manifestpath)) {
      try {
        json = require(manifestpath);
      } catch (err) { /* no file */ }

      if (json) {
        const manifestRoot = path.dirname(manifestpath);

        details.manifestpath = manifestpath;
        details.name = json.name || pkgname;
        details.version = json.version;
        if (json.main) {
          details.main = path.join(manifestRoot, json.main);
        } else {
          const fp = path.join(manifestRoot, 'index.js');

          if (fs.existsSync(fp)) details.main = fp;
        }
        // Resolve json.browser aliasing
        if (json.browser) {
          if ('string' == typeof json.browser) {
            details.main = path.join(manifestRoot, json.browser);
          } else {
            details.aliases = Object.assign(details.aliases, alias.parse(manifestRoot, json.browser));
            // Handle 'main' aliasing
            for (const key in details.aliases) {
              if (key == details.main) details.main = details.aliases[key];
            }
          }
        }
        // Store main as alias
        if (details.main) details.aliases[pkgpath] = details.main;
      }
    }

    // Set id
    // Ignore version if root package
    details.id = details.name + (!details.isRoot && details.version ? VERSION_DELIMITER + details.version : '');

    // Retrieve existing pkg with same id
    if (existingPkg = cache.getPackage(details.id)) return existingPkg;

    // Handle scoped
    if (path.basename(details.dirname).indexOf('@') == 0) details.dirname = path.dirname(details.dirname);

    // Gather all reachable paths
    // Adding 'cwd' breaks Node semantics
    details.paths = [...resolveNodeModules(pkgpath), ...options.sources, cwd, ...options.globalSources];

    // Cache
    cache.setPackage(details);

    return details;
  }
};

/**
 * Resolve package path from 'filepath'
 * @param {String} filepath
 * @returns {String}
 */
function resolvePath (filepath) {
  filepath = filepath.replace(RE_TRAILING, '');

  // Find nearest node_modules directory
  if (~filepath.indexOf('node_modules')) {
    const parts = filepath.split(path.sep);
    let idx = parts.lastIndexOf('node_modules');

    if (idx < parts.length - 1) idx += 2;
    // Handle scoped
    if (parts[idx - 1].charAt(0) == '@') idx++;

    return parts.slice(0, idx).join(path.sep);
  }

  const cwd = process.cwd();

  if (~filepath.indexOf(cwd)) {
    let depth = MAX_FS_DEPTH;
    let dir = filepath;
    let parent = '';

    while (true) {
      parent = path.dirname(dir);
      // Stop if we hit max file system depth or root
      // Convert to lowercase to fix problems on Windows
      if (!--depth || parent.toLowerCase() === dir.toLowerCase()) {
        break;
      }

      const nodeModulespath = path.resolve(dir, 'node_modules');

      // Stop at nearest directory with node_modules or cwd
      if (dir == cwd || fs.existsSync(nodeModulespath)) return dir;

      // Walk
      dir = parent;
    }
  }

  // Return project directory if file isn't a project file
  return cwd;
}

/**
 * Resolve package name from 'pkgpath'
 * @param {String} pkgpath
 * @returns {String}
 */
function resolveName (pkgpath) {
  pkgpath = pkgpath.replace(RE_TRAILING, '');

  const cwd = process.cwd();
  const parts = pkgpath.split(path.sep);
  const len = parts.length;

  let idx = 1;

  // Handle packages nested under root
  if (!~pkgpath.indexOf('node_modules') && cwd != pkgpath) {
    // Increase by distance from root
    idx += path.relative(cwd, pkgpath).split(path.sep).length;
  // Handle scoped node_modules
  } else if (parts[len - 2].charAt(0) == '@') {
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
function resolveId (details, filepath) {
  let name = '';

  if ('string' == typeof filepath) {
    if (details.isRoot && filepath == details.main) return details.id;

    const version = (!details.isRoot && details.version) ? VERSION_DELIMITER + details.version : '';

    details.paths.some((sourcepath) => {
      if (~filepath.indexOf(sourcepath)) {
        name = path.relative(sourcepath, filepath);
        return true;
      }
    });

    name = ((process.platform == 'win32') ? name.replace(/\\/g, '/') : name) + version;
  }

  return name;
}

/**
 * Gather all node_modules directories reachable from 'pkgpath'
 * @param {String} pkgpath
 * @returns {Array}
 */
function resolveNodeModules (pkgpath) {
  let dir = pkgpath;
  let dirs = [];
  let depth = MAX_FS_DEPTH;
  let parent;

  while (true) {
    parent = path.dirname(dir);
    // Stop if we hit max file system depth or root
    // Convert to lowercase to fix problems on Windows
    if (!--depth || parent.toLowerCase() === dir.toLowerCase()) {
      break;
    }

    const nodeModulespath = path.resolve(dir, 'node_modules');

    if (fs.existsSync(nodeModulespath)) dirs.push(nodeModulespath);

    // Walk
    dir = parent;
  }

  return dirs;
}