// Export
exports.create = function () {
	return new TemplateCache();
};

/**
 * Constructor
 */
function TemplateCache () {
	this.cache = {};
	// Store library reference in order to invalidate internal cache if necessary
	this.lib = null;
}

/**
 * Determine if template with 'name' exists in cache
 * @param {String} name
 * @returns {Boolean}
 */
TemplateCache.prototype.hasSource = function (name) {
	return !!this.cache[name];
};

/**
 * Retrieve cached by 'name'
 * @param {String} name
 * @returns {Object}
 */
TemplateCache.prototype.getSource = function (name) {
	return this.cache[name];
};

/**
 * Cache 'content' by 'name'
 * @param {String} name
 * @param {String|Object} content
 */
TemplateCache.prototype.setSource = function (name, content) {
	if (!this.hasSource(name)) {
		this.cache[name] = {src: content, path: name};
	}
};

/**
 * Reset
 */
TemplateCache.prototype.reset = function () {
	this.cache = {};
	// Reset internal library cache
	if (this.lib) this.lib.cache = {};
};