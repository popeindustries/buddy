'use strict';

const cnsl = require('../utils/cnsl');

const strong = cnsl.strong;
const warn = cnsl.warn;

/**
 * Compress 'file' content
 * @param {File} file
 * @param {Object} options
 * @param {Function} fn(err, content)
 * @returns {null}
 */
module.exports = function (file, options, fn) {
  const compressors = file.options.compressors;

  if (compressors[file.type]) return compressors[file.type].compress(file.content, options || {}, fn);

  warn(`no compressor plugin installed for ${strong(file.type)}\nplugins are installed with npm (https://github.com/popeindustries/buddy/blob/master/README.md#plugins)`);
  fn(null, file.content);
};