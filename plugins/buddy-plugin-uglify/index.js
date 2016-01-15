'use strict';

const uglify = require('uglify-js');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'uglify-js',
  type: 'js'
};

/**
 * Compress 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compress = function compress (content, options, fn) {
  try {
    // TODO: add 'comments' option
    content = uglify.minify(content, { fromString: true }).code;
    fn(null, content);
  } catch (err) {
    fn(err);
  }
};