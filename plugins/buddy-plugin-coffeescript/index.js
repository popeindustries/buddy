'use strict';

const coffee = require('coffee-script')

  , SETTINGS = {
      // Compile without function wrapper
      bare: true
    };

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'coffeescript',
  extensions: {
    js: ['coffee']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  try {
    content = coffee.compile(content, Object.assign({}, SETTINGS, options));
    fn(null, content);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};