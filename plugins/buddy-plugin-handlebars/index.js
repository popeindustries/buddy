'use strict';

const handlebars = require('handlebars');

const DEFAULT_OPTIONS = {
  simple: true
};

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'handlebars',
  extensions: {
    html: [
      'handlebars',
      'hbs'
    ]
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  try {
    // Register includes
    if (options.includes) {
      options.includes.forEach((include) => {
        handlebars.registerPartial(include.content, include.id);
      });
    }

    const template = handlebars.compile(content);

    fn(null, template(options.data || {}));
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};