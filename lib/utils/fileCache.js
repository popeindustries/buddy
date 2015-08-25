'use strict';

var EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, path = require('path')
	, Watcher = require('yaw');

// Export
module.exports = function (watch) {
	return new FileCache(watch);
};

/**
 * Constructor
 * @param {Boolean} watch
 */
function FileCache (watch) {
	this._cache = {};
	this._dirs = [];
	this.watching = watch;

	if (watch) {
		this.watcher = new Watcher();
		this.watcher.on('change', this.onWatchChange.bind(this));
		this.watcher.on('delete', this.onWatchDelete.bind(this));
		this.watcher.on('error', this.onWatchError.bind(this));
	}

	EventEmitter.call(this);
}

// Inherit
inherit(FileCache, EventEmitter);

/**
 * Store a 'file' in the cache
 * @param {File} file
 * @returns {File}
 */
FileCache.prototype.addFile = function (file) {
	if (!this._cache[file.filepath]) {
		var dir = path.dirname(file.filepath);

		this._cache[file.filepath] = file;
		if (!~this._dirs.indexOf(dir)) this._dirs.push(dir);
		if (this.watching) this.watcher.watch(file.filepath);
	}

	return file;
};

/**
 * Remove an file from the cache by it's 'filepath'
 * @param {Object} file
 * @returns {File}
 */
FileCache.prototype.removeFile = function (file) {
	delete this._cache[file.filepath];
	if (this.watching) this.watcher.unwatch(file.filepath);
	return file;
};

/**
 * Retrieve an item from the cache by 'key' (filepath or type:id)
 * @param {String} key
 * @returns {Object}
 */
FileCache.prototype.getFile = function (key) {
	return this._cache[key];
};

/**
 * Determine if the cache contains a file by 'key' (filepath or type:id)
 * @param {String} key
 * @returns {Boolean}
 */
FileCache.prototype.hasFile = function (key) {
	return this._cache[key] != null;
};

/**
 * Retrieve all file paths
 * @returns {Array}
 */
FileCache.prototype.getPaths = function () {
	return Object.keys(this._cache);
};

/**
 * Retrieve all unique directories
 * @returns {Array}
 */
FileCache.prototype.getDirs = function () {
	return this._dirs;
};

/**
 * Flush the cache
 */
FileCache.prototype.flush = function () {
	if (this.watching) this.watcher.clean();
	this._cache = {};
	this._dirs = [];
};

/**
 * Handle changes to watched files
 * @param {String} filepath
 * @param {Stats} stats
 */
FileCache.prototype.onWatchChange = function (filepath, stats) {
	var file = this._cache[filepath];

	// Reset file
	if (file) {
		// Hard reset
		file.reset(true);
		this.emit('change', file);
	}
};

/**
 * Handle deleted watched files
 * @param {String} filepath
 */
FileCache.prototype.onWatchDelete = function (filepath) {
	var file = this._cache[filepath];

	// Destroy file
	if (file) {
		file.destroy();
		this.removeFile(file);
	}
};

/**
 * Handle error watching files
 * @param {Error} err
 */
FileCache.prototype.onWatchError = function (err) {
	this.emit('error', err);
};