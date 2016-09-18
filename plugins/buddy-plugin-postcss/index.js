'use strict';

var postcss = require('postcss');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'postcss',
  extensions: {
    css: ['css']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  var plugins = [
    require('postcss-import'),
    require('postcss-css-variables'),
    require('autoprefixer')
  ];

  var filepath = options ? options.filepath : null;

  postcss(plugins)
    .process(content, { from: filepath })
    .then((result) => {
      fn(null, result.css);
    })
    .catch((err) => {
      err.filepath = filepath;
      fn(err);
    });
};
