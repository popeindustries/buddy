'use strict';

const nunjucks = require('nunjucks')

  , Template = nunjucks.Template;

let env;

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'nunjucks',
  extensions: {
    html: [
      'nunjucks',
      'nunjs'
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
  // Setup cache
  if (!env) {
    env = new nunjucks.Environment(options.cache, { autoescape: true });
    options.cache.lib = env;
  }

  try {
    // Store includes
    if (options.includes) {
      options.includes.forEach((include) => {
        if (!options.cache.hasSource(include.filepath)) {
          options.cache.setSource(include.filepath, new Template(include.content, env, include.filepath));
        }
      });
    }

    fn(null, env.renderString(content, options.data || {}, {
      path: options.filepath,
      name: options.filepath
    }));

  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};