var Watcher = require('yaw')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits;

module.exports = FileCache;

/**
 * Constructor
 */
function FileCache (watch) {
	this._cache = {};
	if (watch) {
		this.watching = true;
		this.watcher = new Watcher();
		this.watcher.on('change', this.onWatchChange.bind(this));
		this.watcher.on('delete', this.onWatchDelete.bind(this));
		this.watcher.on('error', this.onWatchError.bind(this));
	} else {
		this.watching = false;
	}

	EventEmitter.call(this);
}

// Inherit
inherit(FileCache, EventEmitter);

/**
 * Store an 'item' by 'filepath' in the cache
 * @param {String} filepath
 * @param {File} file
 * @returns {File}
 */
FileCache.prototype.addFile = function(filepath, file) {
	if (!this._cache[filepath]) {
		this._cache[filepath] = file;
		if (this.watching) this.watcher.watch(filepath);
	}
	return file;
};

/**
 * Remove an file from the cache by it's 'filepath'
 * @param {String} filepath
 * @param {Object} file
 * @returns {File}
 */
FileCache.prototype.removeFile = function(filepath) {
	var file = this._cache[filepath];
	if (file) delete this._cache[filepath];
	return file;
};

/**
 * Retrieve an item from the cache by it's 'filepath'
 * @param {String} filepath
 * @returns {Object}
 */
FileCache.prototype.getFile = function(filepath) {
	return this._cache[filepath];
};

/**
 * Determine if the cache contains an item by it's 'filepath'
 * @param {String} filepath
 * @returns {Boolean}
 */
FileCache.prototype.hasFile = function(filepath) {
	return this._cache[filepath] != null;
};

/**
 * Flush the cache
 */
FileCache.prototype.flush = function() {
	this._cache = {};
};

/**
 * Handle changes to watched files
 * @param {String} filepath
 * @param {Stats} stats
 */
FileCache.prototype.onWatchChange = function(filepath, stats) {
	var self = this
		, file = this._cache[filepath];
	// Reset file
	if (file) {
		file.reset(true);
		// Read new content and notify
		file.read();
		self.emit('change', file);
	}
};

/**
 * Handle deleted watched files
 * @param {String} filepath
 */
FileCache.prototype.onWatchDelete = function(filepath) {
	var file = this._cache[filepath];
	// Destroy file
	if (file) {
		file.destroy();
		this.removeFile(filepath);
	}
};

/**
 * Handle error watching files
 * @param {Error} err
 */
FileCache.prototype.onWatchError = function(err) {
	this.emit('change', err);
};