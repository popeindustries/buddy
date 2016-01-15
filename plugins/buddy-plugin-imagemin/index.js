'use strict';

const Imagemin = require('imagemin');

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

    new Imagemin()
      .src(content)
      .use(Imagemin.gifsicle())
      .use(Imagemin.jpegtran())
      .use(Imagemin.optipng({ optimizationLevel: 3 }))
      .use(Imagemin.svgo())
      .run((err, files) => {
        if (err) return fn(err);
        content = files[0].contents;
        if (asString) content = content.toString();
        fn(null, content);
      });
  } catch (err) {
    fn(err);
  }
};