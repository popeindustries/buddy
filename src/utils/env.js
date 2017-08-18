// @flow

'use strict';

import type File from '../File';
export type EnvUtils = (string, Array<string | File>, ?string) => void;

const path = require('path');

const RE_ILLEGAL_ID = /[\- .*]/g;

/**
 * Set BUDDY env 'key'
 */
module.exports = function env(key: string, value: Array<string | File>, id?: string) {
  id = typeof id === 'string' ? id.replace(RE_ILLEGAL_ID, '').toUpperCase() + '_' : '';
  if (!Array.isArray(value)) {
    value = [value];
  }

  process.env[`BUDDY_${id}${key}`] = value.reduce((value: string, item: string | File) => {
    if (value.length > 0) {
      value += ','
    }

    switch (key) {
      case 'INPUT':
        value += typeof item !== 'string' ? path.relative(process.cwd(), item.filepath) : item;
        break;
      case 'INPUT_HASH':
        value += typeof item !== 'string' ? item.hash : item;
        break;
      case 'INPUT_DATE':
        value += typeof item !== 'string' ? item.date : item;
        break;
      case 'OUTPUT':
        value += typeof item !== 'string' ? path.relative(process.cwd(), item.writepath) : item;
        break;
      case 'OUTPUT_HASH':
        value += typeof item !== 'string' ? item.writeHash : item;
        break;
      case 'OUTPUT_DATE':
        value += typeof item !== 'string' ? item.writeDate : item;
        break;
      case 'OUTPUT_URL':
        value += typeof item !== 'string' ? item.writeUrl : item;
        break;
    }

    return value;
  }, '');
};
