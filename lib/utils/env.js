// @flow

'use strict';

const { isInvalid } = require('./is');
const File = require('../File');
const path = require('path');

const RE_ILLEGAL_ID = /[\- .*]/g;

/**
 * Set BUDDY env 'key'
 */
module.exports = function env(key /*: string */, value /*: Array<string | File> */, id /*: ?string */) {
  id = !isInvalid(id) ? id.replace(RE_ILLEGAL_ID, '').toUpperCase() + '_' : '';
  if (!Array.isArray(value)) {
    value = [value];
  }

  const valueString = value.reduce((value /*: string */, item /*: string | File */) => {
    const isFile = item instanceof File;

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
        value += isFile ? path.relative(process.cwd(), item.writepath) : item;
        break;
      case 'OUTPUT_HASH':
        value += isFile ? item.writeHash : item;
        break;
      case 'OUTPUT_DATE':
        value += isFile ? item.writeDate : item;
        break;
      case 'OUTPUT_URL':
        value += isFile ? item.writeUrl : item;
        break;
    }

    return value;
  }, '');
  // console.log(`BUDDY_${id}${key}`, value);
  process.env[`BUDDY_${id}${key}`] = valueString;
};
