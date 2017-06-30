'use strict';

const { findFilepath, isFilepath, isRelativeFilepath } = require('../utils/filepath');
const { isInvalid, isString, isNullOrUndefined } = require('../utils/is');
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
  parse(pkgpath, aliases, type, fileExtensions) {
    const parsedAliases = {};

    if (isNullOrUndefined(pkgpath) || isNullOrUndefined(aliases)) {
      return parsedAliases;
    }

    for (let key in aliases) {
      let value = aliases[key];

      if (isRelativeFilepath(key)) {
        key = path.resolve(pkgpath, key);
      }
      if (isString(value) && isRelativeFilepath(value)) {
        value = path.resolve(pkgpath, value);
      }

      // Resolve missing file paths
      if (!isInvalid(type) && !isNullOrUndefined(fileExtensions)) {
        if (isFilepath(key)) {
          key = findFilepath(key, type, fileExtensions) || key;
        }
        if (isFilepath(value)) {
          value = findFilepath(value, type, fileExtensions) || value;
        }
      }

      // Avoid circular trap
      if (!(value in parsedAliases)) {
        parsedAliases[key] = value;
      }
    }

    return parsedAliases;
  },

  /**
   * Resolve alias for 'id'
   * @param {String} id
   * @param {Object} aliases
   * @returns {String}
   */
  resolve(id, aliases) {
    if (isInvalid(id) || isNullOrUndefined(aliases)) {
      return id;
    }

    // Follow chain of aliases
    // a => b; b => c; c => d
    while (id in aliases) {
      id = aliases[id];
    }

    // Check for disabled packages
    if (!isInvalid(id) && !isFilepath(id)) {
      // Packages should always be written with forward slash
      const parts = id.split('/');
      // Handle scoped
      const pkg = parts.slice(0, parts[0].charAt(0) == '@' ? 2 : 1).join('/');

      if (aliases[pkg] === false) {
        id = false;
      }
    }

    return id;
  },

  /**
   * Resolve id for 'alias'
   * @param {String} alias
   * @param {Object} aliases
   * @returns {String}
   */
  resolveReverse(alias, aliases) {
    if (isInvalid(alias) || isNullOrUndefined(aliases)) {
      return alias;
    }

    for (const id in aliases) {
      if (alias === aliases[id] && !isFilepath(id)) {
        return id;
      }
    }

    return alias;
  }
};
