'use strict';

const { isFilepath, isRelativeFilepath } = require('./utils');
const path = require('path');

module.exports = {
  /**
   * Parse 'aliases' relative to 'pkgpath'
   * @param {String} pkgpath
   * @param {Object} aliases
   * @returns {Object}
   */
  parse (pkgpath, aliases) {
    let parsedAliases = {};

    if (!pkgpath || !aliases) return parsedAliases;

    for (let key in aliases) {
      let value = aliases[key];

      if (isRelativeFilepath(key)) key = path.resolve(pkgpath, key);
      if ('string' == typeof value && isRelativeFilepath(value)) value = path.resolve(pkgpath, value);

      parsedAliases[key] = value;
    }

    return parsedAliases;
  },

  /**
   * Resolve alias for 'id'
   * @param {String} id
   * @param {Object} aliases
   * @returns {String}
   */
  resolve (id, aliases) {
    if (!id || !aliases) return id;

    if (id in aliases) return aliases[id];

    // Check for disabled packages
    if (!isFilepath(id)) {
      // Packages should always be written with forward slash
      const parts = id.split('/');
      // Handle scoped
      const pkg = parts.slice(0, (parts[0].charAt(0) == '@') ? 2 : 1).join('/');

      if (aliases[pkg] === false) return false;
    }

    return id;
  }
};