'use strict';

const uglify = require('uglify-js');

const DEFAULT_OPTIONS = {
  output: {
    // Preserve special multiline comments
    comments: function comments (node, comment) {
      const text = comment.value;
      const type = comment.type;

      if (type == 'comment2') {
	return /@preserve|@license|@cc_on/i.test(text);
      }
    }
  },
  fromString: true
};

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
    const compressorOptions = Object.assign({}, DEFAULT_OPTIONS);

    if (options.except) compressorOptions.mangle = { except: options.except };
    content = uglify.minify(content, compressorOptions).code;
    fn(null, content);
  } catch (err) {
    fn(err);
  }
};