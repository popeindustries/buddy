'use strict';

const cnsl = require('../utils/cnsl')

  , strong = cnsl.strong
  , warn = cnsl.warn;

/**
 * Compress 'content'
 * @param {String} type
 * @param {String} content
 * @param {Object} compressors
 * @param {Function} fn(err, content)
 * @returns {null}
 */
module.exports = function (type, content, compressors, fn) {
  if (compressors[type]) return compressors[type].compress(content, {}, fn);

  warn('no compressor plugin installed for ' + strong(type) + '\nplugins are installed with npm (https://github.com/popeindustries/buddy/blob/master/README.md#plugins)');
  fn(null, content);
};