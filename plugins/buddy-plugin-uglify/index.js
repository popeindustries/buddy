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
    const compressorOptions = { fromString: true };

    if (options.except) compressorOptions.mangle = { except: options.except };
    content = uglify.minify(content, compressorOptions).code;
    fn(null, content);
  } catch (err) {
    fn(err);
  }
};