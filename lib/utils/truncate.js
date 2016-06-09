'use strict';

const SEG_LENGTH = 30;

/**
 * Truncate 'str'
 * @param {String} str
 * @returns {String}
 */
module.exports = function truncate (str) {
  if (str.length > (SEG_LENGTH * 2) + 3) {
    return str.slice(0, SEG_LENGTH) + '...' + str.slice(-SEG_LENGTH);
  }

  return str;
};