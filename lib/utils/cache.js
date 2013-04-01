module.exports = Cache;

/**
 * Constructor
 */
function Cache () {
	this._cache = {};
}

/**
 * Store an 'item' by 'id' in the cache
 * @param {String} id
 * @param {Object} item
 * @returns {Object}
 */
Cache.prototype.addItem = function(id, item) {
	if (!this._cache[id]) this._cache[id] = item;
	return item;
};

/**
 * Remove an item from the cache by it's 'id'
 * @param {String} id
 * @param {Object} item
 * @returns {Object}
 */
Cache.prototype.removeItem = function(id) {
	var item;
	if (item = this._cache[id]) delete this._cache[id];
	return item;
};

/**
 * Retrieve an item from the cache by it's 'id'
 * @param {String} id
 * @returns {Object}
 */
Cache.prototype.getItem = function(id) {
	return this._cache[id];
};

/**
 * Determine if the cache contains an item by it's 'id'
 * @param {String} id
 * @returns {Boolean}
 */
Cache.prototype.hasItem = function(id) {
	return this._cache[id] != null;
};

/**
 * Flush the cache
 */
Cache.prototype.flush = function() {
	this._cache = {};
};