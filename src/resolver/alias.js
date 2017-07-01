// @flow

'use strict';

type Aliases = {
  [string]: string
};

const { findFilepath, isFilepath, isRelativeFilepath } = require('../utils/filepath');
const { isInvalid } = require('../utils/is');
const path = require('path');

module.exports = {
  /**
   * Parse 'aliases' relative to 'pkgpath'
   */
  parse(pkgpath: string, aliases: Aliases, type: string, fileExtensions: Object): Aliases {
    const parsedAliases = {};

    if (pkgpath == null || aliases == null) {
      return parsedAliases;
    }

    for (let key in aliases) {
      let value = aliases[key];

      if (isRelativeFilepath(key)) {
        key = path.resolve(pkgpath, key);
      }
      if (typeof value === 'string' && isRelativeFilepath(value)) {
        value = path.resolve(pkgpath, value);
      }

      // Resolve missing file paths
      if (!isInvalid(type) && fileExtensions != null) {
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
   */
  resolve(id: string, aliases: Aliases): string | boolean {
    if (isInvalid(id) || aliases == null) {
      return id;
    }

    // TODO: guard against endless loop
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
      const pkg = parts.slice(0, parts[0].charAt(0) === '@' ? 2 : 1).join('/');

      if (aliases[pkg] === false) {
        return false;
      }
    }

    return id;
  },

  /**
   * Resolve id for 'alias'
   */
  resolveReverse(alias: string, aliases: Aliases): string {
    if (isInvalid(alias) || aliases == null) {
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
