(function(root) {
  /**
   * Load or retrieve cached version of requested module with id 'path' or 'path/index'
   * @param {String} path
   * @returns {Object}
   */
  function require (path) {
    // Find in cache
    var m = require.modules[path];

    if (!m) throw new Error("Couldn't find module for: " + path);

    // Instantiate the module if it's export object is not yet defined
    if (!m.exports) {
      m.exports = {};
      m.filename = path;
      m.call(null, require, m, m.exports);
    }

    // Return the exports object
    return m.exports;
  }

  // Cache of module objects
  require.modules = {};

  /**
   * Register a module with id of 'path' and callback of 'fn'
   * @param {String} path
   * @param {Function} fn [signature should be of type (require, module, exports)]
   */
  require.register = function requireRegister (path, fn) {
    require.modules[path] = fn;
  };

  // Expose
  root.require = require;
})((typeof window !== 'undefined') ? window : global);