'use strict';

const { isRelativeFilepath } = require('./utils');
const { VERSION_DELIMITER } = require('./config');
const cache = require('./cache');
const fs = require('fs');
const path = require('path');

const RE_TRAILING = /\/+$|\\+$/g;

module.exports = {
  resolveId,
  resolveName,
  resolvePath,

  /**
   * Retrieve package details for 'filepath'
   * @param {String} filepath
   * @param {Object} options
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
      aliases: {},
      dirname: path.dirname(pkgpath),
      id: '',
      isRoot: pkgpath == process.cwd(),
      manifestpath: '',
      main: '',
      name: pkgname,
      paths: [pkgpath],
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
            for (const key in json.browser) {
              const value = json.browser[key];
              let rKey = path.resolve(pkgpath, key);
              let rValue;

              // Fix for missing relative path prefix
              if (!isRelativeFilepath(key) && !fs.existsSync(rKey)) rKey = key;
              if ('string' == typeof value) {
                rValue = path.resolve(pkgpath, value);
                if (!isRelativeFilepath(value) && !fs.existsSync(rValue)) rValue = value;
              } else {
                rValue = value;
              }

              details.aliases[key] = value;
              // Resolve relative
              if (key != rKey || value != rValue) details.aliases[rKey] = rValue;
              // Handle 'main' aliasing
              if (details.main == rKey) details.main = rValue;
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

    // Parse reachable paths
    details.paths = parseNodeModules(pkgpath);
    if (pkgpath == process.cwd()) details.paths = details.paths.concat(options.sources);

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

    for (let i = details.paths.length - 1; i >= 0; i--) {
      if (~filepath.indexOf(details.paths[i])) {
        name = path.relative(details.paths[i], filepath);
        break;
      }
    }

    name = ((process.platform == 'win32') ? name.replace(/\\/g, '/') : name) + version;
  }

  return name;
}

/**
 * Gather all node_modules directories reachable from 'pkgpath'
 * @param {String} pkgpath
 * @returns {Array}
 */
function parseNodeModules (pkgpath) {
  const root = path.dirname(process.cwd());
  let dir = pkgpath;
  let dirs = [];
  let parent, nodeModulespath;

  while (true) {
    parent = path.dirname(dir);
    // Stop if we are out of project directory or file system root
    // Convert to lowercase to fix problems on Windows
    if (dir.toLowerCase() === root.toLowerCase() || parent.toLowerCase() === dir.toLowerCase()) {
      break;
    }

    nodeModulespath = path.resolve(dir, 'node_modules');
    if (fs.existsSync(nodeModulespath)) dirs.push(nodeModulespath);

    // Walk
    dir = parent;
  }

  dirs.push(pkgpath);

  return dirs.reverse();
}