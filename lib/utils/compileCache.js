'use strict';

// Export
exports.create = function () {
  return new Cache();
};

class Cache {
  /**
   * Constructor
   */
  constructor () {
    this._cache = {};
    // Store library reference in order to invalidate internal cache if necessary
    this.lib = null;
  }

  /**
   * Determine if template with 'name' exists in cache
   * @param {String} name
   * @returns {Boolean}
   */
  hasSource (name) {
    return !!this._cache[name];
  }

  /**
   * Retrieve cached by 'name'
   * @param {String} name
   * @returns {Object}
   */
  getSource (name) {
    return this._cache[name];
  }

  /**
   * Cache 'content' by 'name'
   * @param {String} name
   * @param {Object} source
   * @param {Boolean} force
   */
  setSource (name, source, force) {
    if (force || !this.hasSource(name)) {
      this._cache[name] = source;
    }
  }

  /**
   * Reset
   */
  reset () {
    this._cache = {};
    // Reset internal library cache
    if (this.lib) this.lib.cache = {};
  }
}