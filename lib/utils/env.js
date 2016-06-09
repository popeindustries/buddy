'use strict';

const path = require('path');

const RE_ILLEGAL_ID = /[\- .*]/g;

/**
 * Set BUDDY env 'key'
 * @param {String} key
 * @param {String|Array} value
 * @param {String} [id]
 */
module.exports = function env (key, value, id) {
  id = (id != null)
    ? id.replace(RE_ILLEGAL_ID, '').toUpperCase() + '_'
    : '';

  if (Array.isArray(value)) {
    value = value.reduce((value, item) => {
      const isFile = 'object' == typeof item && 'extension' in item;

      switch (key) {
        case 'INPUT':
          value += isFile ? path.relative(process.cwd(), item.filepath) : item;
          break;
        case 'INPUT_HASH':
          value += isFile ? item.hash : item;
          break;
        case 'INPUT_DATE':
          value += isFile ? item.date : item;
          break;
        case 'OUTPUT':
          value += path.relative(process.cwd(), item);
          break;
        case 'OUTPUT_HASH':
        case 'OUTPUT_DATE':
          value += item;
          break;
      }

      return value;
    }, '');
  }

  process.env[`BUDDY_${id}${key}`] = value;
};