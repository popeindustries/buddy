'use strict';

const less = require('less');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'less',
  extensions: {
    css: ['less']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  less.render(content, (err, content) => {
    if (err) {
      err.filepath = options.filepath;
      return fn(err);
    }
    fn(null, content.css);
  });
};
