'use strict';

var path = require('path')
  , twig = require('twig').twig;

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'twig',
  extensions: {
    html: ['twig']
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
    const template = twig({
      path: options.filepath,
      base: path.dirname(options.filepath),
      async: false
    });

    fn(null, template.render(options));
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};
