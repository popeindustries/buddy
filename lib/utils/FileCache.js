'use strict';

var Watcher = require('yaw')
	, path = require('path')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits;

module.exports = FileCache;

/**
 * Constructor
 */
function FileCache (watch) {
	this._cache = {};
	this._dirs = [];

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
 * Store a 'file' in the cache
 * @param {File} file
 * @returns {File}
 */
FileCache.prototype.addFile = function (file) {
	var filepath = file.filepath
		, id = file.type + ':' + file.id;

	if (!this._cache[filepath] && !this._cache[id]) {
		var dir = path.dirname(filepath);
		this._cache[filepath] = file;
		this._cache[id] = file;
		if (!~this._dirs.indexOf(dir)) this._dirs.push(dir);
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
FileCache.prototype.removeFile = function (file) {
	delete this._cache[file.filepath];
	delete this._cache[file.type + ':' + file.id];
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
	return Object.keys(this._cache)
		.filter(function (key) {
			// Filter out type:id keys
			return !~key.indexOf(':');
		});
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