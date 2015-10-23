'use strict';

var csso = require('csso')
  , Imagemin = require('imagemin')
	, uglify = require('uglify-js');

/**
 * Compress 'content'
 * @param {String} type
 * @param {String} content
 * @param {Function} fn
 * @returns {String}
 */
module.exports = function (type, content, fn) {
  try {
    if (type == 'js') {
  		content = uglify.minify(content, { fromString: true }).code;
      fn(null, content);
    } else if (type == 'css') {
      content = csso.minify(content);
      fn(null, content);
    } else if (type == 'image') {
      new Imagemin()
        .src(content)
        .use(Imagemin.gifsicle())
        .use(Imagemin.jpegtran())
        .use(Imagemin.optipng({ optimizationLevel: 3 }))
        .use(Imagemin.svgo())
        .run(function (err, files) {
          if (err) return fn(err);
          fn(null, files[0].contents);
        });
    } else {
      fn(null, content);
    }
  } catch (err) {
    fn(err);
  }
};