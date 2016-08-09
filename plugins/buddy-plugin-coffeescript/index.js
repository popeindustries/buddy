'use strict';

const coffee = require('coffee-script');

const DEFAULT_OPTIONS = {
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
    content = coffee.compile(content, Object.assign({}, DEFAULT_OPTIONS, options));
    fn(null, content);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};