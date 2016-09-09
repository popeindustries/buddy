// Export
exports.create = function () {
	return new Cache();
};

/**
 * Constructor
 */
function Cache () {
	this.cache = {};
	// Store library reference in order to invalidate internal cache if necessary
	this.lib = null;
}

/**
 * Determine if template with 'name' exists in cache
 * @param {String} name
 * @returns {Boolean}
 */
Cache.prototype.hasSource = function (name) {
	return !!this.cache[name];
};

/**
 * Retrieve cached by 'name'
 * @param {String} name
 * @returns {Object}
 */
Cache.prototype.getSource = function (name) {
	return this.cache[name];
};

/**
 * Cache 'content' by 'name'
 * @param {String} name
 * @param {Object} template
 */
Cache.prototype.setSource = function (name, template) {
	if (!this.hasSource(name)) {
		this.cache[name] = template;
	}
};

/**
 * Reset
 */
Cache.prototype.reset = function () {
	this.cache = {};
	// Reset internal library cache
	if (this.lib) this.lib.cache = {};
};