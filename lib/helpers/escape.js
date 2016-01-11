'use strict';

const RE_ESCAPE = /\\|\r?\n|"/g
  , ESCAPE_MAP = {
    '\\': '\\\\',
    '\n': '\\n',
    '\r\n': '\\n',
    '"': '\\"'
  };

/**
 * Escape 'content' and stringify for lazy js modules
 * @param {String} content
 * @returns {String}
 */
module.exports = function (content) {
  return '"'
    + content.replace(RE_ESCAPE, (m) => {
        return ESCAPE_MAP[m];
      })
    + '"';
};