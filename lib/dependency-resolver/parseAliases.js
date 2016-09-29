'use strict';

const { isRelativeFilepath } = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * Parse 'aliases' relative to 'pkgpath'
 * @param {String} pkgpath
 * @param {Object} aliases
 * @returns {Object}
 */
module.exports = function parseAliases (pkgpath, aliases) {
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
};