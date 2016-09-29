'use strict';

const { isFilepath, isRelativeFilepath } = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * Parse 'aliases' relative to 'pkgpath'
 * @param {String} pkgpath
 * @param {Object} aliases
 * @returns {Object}
 */
module.exports = {
  parse (pkgpath, aliases) {
    let parsedAliases = {};

    for (const key in aliases) {
      const value = aliases[key];
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

      parsedAliases[key] = value;
      // Resolve relative
      if (key != rKey || value != rValue) parsedAliases[rKey] = rValue;
    }

    return parsedAliases;
  },

  /**
   * Resolve alias for 'id'
   * @param {Object} pkgDetails
   * @param {String} id
   * @returns {String}
   */
  resolve (pkgDetails, id) {
    if (!pkgDetails || !id) return id;

    const { aliases } = pkgDetails;

    if (id in aliases) return aliases[id];

    // Match packages
    if (!isFilepath(id)) {
      const parts = id.split(path.sep);
      // Handle scoped
      const pkg = parts.slice(0, (parts[0].charAt(0) == '@') ? 2 : 1).join(path.sep);

      // Disable whole package
      if (aliases[pkg] === false) return false;
    }

    return id;
  }
};