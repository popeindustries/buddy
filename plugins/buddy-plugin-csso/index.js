'use strict';

const csso = require('csso');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'csso',
  type: 'css'
};

/**
 * Compress 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compress = function compress (content, options, fn) {
  try {
    content = csso.minify(content);
    fn(null, content);
  } catch (err) {
    fn(err);
  }
};