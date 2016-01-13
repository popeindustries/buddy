'use strict';

var stylus = require('stylus');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'stylus',
  extensions: {
    css: ['styl']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  stylus.render(content, Object.assign({}, options), (err, content) => {
    if (err) {
      err.filepath = options.filepath;
      return fn(err);
    }
    fn(null, content);
  });
};
