'use strict';

const gifsicle = require('imagemin-gifsicle');
const imagemin = require('imagemin');
const jpegtran = require('imagemin-jpegtran');
const optipng = require('imagemin-optipng');
const svgo = require('imagemin-svgo');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'imagemin',
  // TODO: change to 'img'
  type: 'image'
};

/**
 * Compress 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compress = function compress (content, options, fn) {
  try {
    const asString = ('string' == typeof content);

    // Requires buffer
    if (asString) content = new Buffer(content);

    imagemin
      .buffer(content, {
        use: [
          gifsicle(),
          jpegtran(),
          optipng({ optimizationLevel: 3 }),
          svgo()
        ]
      })
      .then((content) => {
        if (asString) content = content.toString();
        fn(null, content);
      })
      .catch(fn);
  } catch (err) {
    fn(err);
  }
};