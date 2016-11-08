'use strict';

const { findFilepath, isFilepath, isRelativeFilepath } = require('../utils/filepath');
const path = require('path');

module.exports = {
  /**
   * Parse 'aliases' relative to 'pkgpath'
   * @param {String} pkgpath
   * @param {Object} aliases
   * @param {String} type
   * @param {Object} fileExtensions
   * @returns {Object}
   */
  parse (pkgpath, aliases, type, fileExtensions) {
    let parsedAliases = {};

    if (!pkgpath || !aliases) return parsedAliases;

    for (let key in aliases) {
      let value = aliases[key];

      if (isRelativeFilepath(key)) key = path.resolve(pkgpath, key);
      if ('string' == typeof value && isRelativeFilepath(value)) value = path.resolve(pkgpath, value);

      // Resolve missing file paths
      if (type && fileExtensions) {
        if (isFilepath(key)) key = findFilepath(key, type, fileExtensions) || key;
        if (isFilepath(value)) value = findFilepath(value, type, fileExtensions) || value;
      }

      // Avoid circular trap
      if (!(value in parsedAliases)) parsedAliases[key] = value;
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

    // Follow chain of aliases
    // a => b; b => c; c => d
    while (id in aliases) {
      id = aliases[id];
    }

    // Check for disabled packages
    if (id && !isFilepath(id)) {
      // Packages should always be written with forward slash
      const parts = id.split('/');
      // Handle scoped
      const pkg = parts.slice(0, (parts[0].charAt(0) == '@') ? 2 : 1).join('/');

      if (aliases[pkg] === false) id = false;
    }

    return id;
  },

  /**
   * Resolve id for 'alias'
   * @param {String} alias
   * @param {Object} aliases
   * @returns {String}
   */
  resolveReverse (alias, aliases) {
    if (!alias || !aliases) return alias;

    for (const id in aliases) {
      if (alias == aliases[id] && !isFilepath(id)) return id;
    }

    return alias;
  }
};