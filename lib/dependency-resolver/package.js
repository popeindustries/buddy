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
      isRoot: pkgpath == process.cwd(),
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
        details.manifestpath = manifestpath;
        details.name = json.name || pkgname;
        details.version = json.version;
        if (json.main) {
          details.main = path.resolve(pkgpath, json.main);
        } else {
          const fp = path.join(pkgpath, 'index.js');

          if (fs.existsSync(fp)) details.main = fp;
        }
        // Resolve json.browser aliasing
        if (json.browser) {
          if ('string' == typeof json.browser) {
            details.main = path.resolve(pkgpath, json.browser);
          } else {
            details.aliases = Object.assign(details.aliases, alias.parse(pkgpath, json.browser));
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
    // Adding 'pkgpath' breaks Node semantics
    details.paths = [...resolveNodeModules(pkgpath), ...options.sources, pkgpath, ...options.globalSources];

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

  const cwd = process.cwd();

  if (~filepath.indexOf('node_modules')) {
    const parts = filepath.split(path.sep);
    let idx = parts.lastIndexOf('node_modules');

    if (idx < parts.length - 1) idx += 2;
    // Handle scoped
    if (parts[idx - 1].charAt(0) == '@') idx++;

    return parts.slice(0, idx).join(path.sep);
  } else if (~filepath.indexOf(cwd)) {
    return cwd;
  }

  // TODO: handle files from outside project path?
  return filepath;
}

/**
 * Resolve package name from 'pkgpath'
 * @param {String} pkgpath
 * @returns {String}
 */
function resolveName (pkgpath) {
  pkgpath = pkgpath.replace(RE_TRAILING, '');

  const parts = pkgpath.split(path.sep);
  const len = parts.length;

  // Handle scoped
  const idx = (parts[len - 2].charAt(0) == '@') ? 2 : 1;

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
  let parent, nodeModulespath;

  while (true) {
    parent = path.dirname(dir);
    // Stop if we hit max file system depth or root
    // Convert to lowercase to fix problems on Windows
    if (!--depth || parent.toLowerCase() === dir.toLowerCase()) {
      break;
    }

    nodeModulespath = path.resolve(dir, 'node_modules');
    if (fs.existsSync(nodeModulespath)) dirs.push(nodeModulespath);

    // Walk
    dir = parent;
  }

  return dirs;
}