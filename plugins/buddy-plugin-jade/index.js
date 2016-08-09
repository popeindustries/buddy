'use strict';

const jade = require('jade');

const DEFAULT_OPTIONS = {
  compileDebug: false,
  pretty: true
};

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'jade',
  extensions: {
    html: ['jade']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  // Copy data to root
  options = Object.assign({}, options, DEFAULT_OPTIONS, options.data);

  jade.render(content, options, (err, content) => {
    if (err) {
      err.filepath = options.filepath;
      return fn(err);
    }
    fn(null, content);
  });
};