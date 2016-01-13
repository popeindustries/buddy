'use strict';

// Load helpers
require('dustjs-helpers');

const dust = require('dustjs-linkedin');

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'dust',
  extensions: {
    js: ['dust']
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
exports.compile = function (content, options, fn) {
  // Keep whitespace
  dust.optimizers.format = function (ctx, node) {
    return node;
  };

  // Precompile includes
  if (options.includes) {
    options.includes.forEach((include) => {
      if (!options.cache.hasSource(include.filepath)) {
        const source = dust.compile(include.content, include.filepath);

        dust.loadSource(source, include.filepath);
        options.cache.setSource(include.filepath, source);
      }
    });
  }

  // Precompile and load
  const source = dust.compile(content, options.filepath);

  dust.loadSource(source, options.filepath);
  dust.render(options.filepath, options.data || {}, (err, content) => {
    if (err) {
      err.filepath = options.filepath;
      return fn(err);
    }
    fn(null, content);
  });
};