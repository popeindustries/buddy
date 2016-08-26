'use strict';

const Cache = require('../utils/compileCache');
const cnsl = require('../utils/cnsl');

const caches = {};
const strong = cnsl.strong;

module.exports = {
  /**
   * Convert 'file' contents to js/css/html
   * @param {File} file
   * @param {Object} options
   * @param {Function} fn(err, content)
   */
  compile (file, options, fn) {
    const compilers = file.options.compilers;

    if (!caches[file.type]) caches[file.type] = Cache.create();

    options.filepath = options.filename = file.filepath;
    options.extension = file.extension;
    options.name = file.name;
    options.cache = caches[file.type];

    if (compilers[file.extension]) {
      compilers[file.extension].compile(file.content, options, fn);
    // Pass through defaults
    } else if (compilers[file.extension] != null) {
      fn(null, file.content);
    } else {
      fn(new Error('no plugin registered to handle '
        + strong(file.extension)
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