'use strict';

const Cache = require('../utils/compileCache')
  , cnsl = require('../utils/cnsl')
  , path = require('path')

  , caches = {}
  , strong = cnsl.strong;

module.exports = {
  /**
   * Convert contents to js/css/html
   * @param {String} filepath
   * @param {String} content
   * @param {Object} compilers
   * @param {Object} options
   * @param {Function} fn(err, content)
   */
  compile (filepath, content, compilers, options, fn) {
    let extension = path.extname(filepath);
    const name = path.basename(filepath).replace(extension, '');

    if (!caches[options.type]) caches[options.type] = Cache.create();

    options.filepath = options.filename = filepath;
    options.extension = extension = extension.slice(1);
    options.name = name;
    options.cache = caches[options.type];

    if (compilers[extension]) {
      compilers[extension].compile(content, options, fn);
    // Pass through defaults
    } else if (compilers[extension] != null) {
      fn(null, content);
    } else {
      fn(new Error('no plugin registered to handle '
        + strong(extension)
        + ' files\nplugins are installed with npm (https://github.com/popeindustries/buddy/blob/master/README.md#plugins)'
      ));
    }
  },

  /**
   * Retrieve helper content by 'type'
   * @param {String} type
   * @returns {String}
   */
  getHelpers (type) {
    return caches[type].getSource(`${type}-helpers`) || '';
  },

  /**
   * Clear template caches
   */
  clearCache () {
    for (const extension in caches) {
      const cache = caches[extension];

      // Store existing helpers
      const helpers = ['js', 'css', 'html'].reduce((helpers, type) => {
        const helper = cache.getSource(`${type}-helpers`);

        if (helper) helpers[type] = helper;
        return helpers;
      }, {});

      // Reset
      cache.reset();

      // Restore
      for (const type in helpers) {
        cache.setSource(`${type}-helpers`, helpers[type], true);
      }
    }
  }
};