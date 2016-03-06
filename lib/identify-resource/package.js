'use strict';

const cache = require('./cache')
  , config = require('./config')
  , fs = require('fs')
  , path = require('path')
  , utils = require('./utils')

  , RE_TRAILING = /\/+$|\\+$/g;

/**
 * Retrieve package details for 'filepath'
 * @param {String} filepath
 * @param {Object} options
 * @returns {Object}
 */
exports.get = function (filepath, options) {
  options = options || {};

  const pkgpath = exports.resolvePath(filepath)
    , pkgname = exports.resolveName(pkgpath)
    , manifestpath = path.resolve(pkgpath, 'package.json');
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
          for (const key in json.browser) {
            const value = json.browser[key];
            let rKey = path.resolve(pkgpath, key)
              , rValue;

            // Fix for missing relative path prefix
            if (!utils.isRelativeFilepath(key) && !fs.existsSync(rKey)) rKey = key;
            if ('string' == typeof value) {
              rValue = path.resolve(pkgpath, value);
              if (!utils.isRelativeFilepath(value) && !fs.existsSync(rValue)) rValue = value;
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
  details.id = details.name + (details.version ? config.VERSION_DELIMITER + details.version : '');

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
};

/**
 * Resolve package path from 'filepath'
 * @param {String} filepath
 * @returns {String}
 */
exports.resolvePath = function (filepath) {
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
};

/**
 * Resolve package name from 'pkgpath'
 * @param {String} pkgpath
 * @returns {String}
 */
exports.resolveName = function (pkgpath) {
  pkgpath = pkgpath.replace(RE_TRAILING, '');

  const parts = pkgpath.split(path.sep)
    , len = parts.length
      // Handle scoped
    , idx = (parts[len - 2].charAt(0) == '@') ? 2 : 1;

  return parts.slice(len - idx).join(path.sep);
};

/**
 * Resolve 'filepath' id
 * @param {Object} details
 * @param {String} filepath
 * @returns {String}
 */
exports.resolveId = function (details, filepath) {
  if ('string' == typeof filepath) {
    const name = path.relative((details.isRoot ? details.pkgpath : details.dirname), filepath)
      , version = (!details.isRoot && details.version) ? config.VERSION_DELIMITER + details.version : '';

    return ((process.platform == 'win32') ? name.replace(/\\/g, '/') : name) + version;
  }

  return '';
};

/**
 * Gather all node_modules directories reachable from 'pkgpath'
 * @param {String} pkgpath
 * @returns {Array}
 */
function parseNodeModules (pkgpath) {
  const root = path.dirname(process.cwd());
  let dir = pkgpath
    , dirs = []
    , details, parent, nodeModulespath;

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

  return dirs;
}