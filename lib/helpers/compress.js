'use strict';

const cnsl = require('../utils/cnsl');

const strong = cnsl.strong;
const warn = cnsl.warn;

/**
 * Compress 'content'
 * @param {String} type
 * @param {String} content
 * @param {Object} compressors
 * @param {Object} options
 * @param {Function} fn(err, content)
 * @returns {null}
 */
module.exports = function (type, content, compressors, options, fn) {
  if (compressors[type]) return compressors[type].compress(content, options || {}, fn);

  warn('no compressor plugin installed for ' + strong(type) + '\nplugins are installed with npm (https://github.com/popeindustries/buddy/blob/master/README.md#plugins)');
  fn(null, content);
};