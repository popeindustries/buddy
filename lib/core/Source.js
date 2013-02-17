var path = require('path')
	, fileFactory = require('./file')
	, reloader = require('../utils/reloader')
	, Watcher = require('../utils/watcher')
	, object = require('../utils/object')
	, notify = require('../utils/notify')
	, debug = notify.debug
	, strong = notify.strong
	, print = notify.print
	, colour = notify.colour
	, fs = require('../utils/fs')
	, indir = fs.indir
	, readdir = fs.readdir
	, existsSync = fs.existsSync
	, ignored = fs.ignored;

module.exports = Source;

/**
 * Constructor
 * @param {String} type
 * @param {Array} sources
 * @param {Object} options
 */
function Source(type, sources, options) {
	var self = this;
	debug("created " + type + " Source instance for: " + (strong(sources)), 2);
	this.type = type;
	this.options = options;
	this._watchers = [];
	this.byPath = {};
	this.byModule = {};
	this.length = 0;
	this.locations = [];
	sources.forEach(function(source) {
		self.locations.push(path.resolve(source));
	});
}

/**
 * Parse sources, generating File instances for valid files
 * @param {Function} fn(err)
 */
Source.prototype.parse = function(fn) {
	var outstanding = 0
		, self = this;
	this.locations.forEach(function(location) {
		outstanding++;
		readdir(location, ignored, function(err, files) {
			outstanding--;
			if (err) return fn(err);
			files.forEach(function(f) {
				self.add(f);
			});
			if (!outstanding) {
				return fn();
			}
		});
	});
};

/**
 * Add a File instance to the cache by 'filepath'
 * @param {String} filepath
 * @returns {Boolean}
 */
Source.prototype.add = function(filepath) {
	var basepath = this._getBasepath(filepath)
		, self = this;
	filepath = path.resolve(filepath);
	if (!this.byPath[filepath] && basepath) {
		// Create File instance
		fileFactory(this.type, filepath, basepath, object.clone(this.options), function(err, instance) {
			if (err) return;
			self.length++;
			self.byPath[instance.filepath] = instance;
			self.byModule[instance.moduleID] = instance;
		});
		return true;
	} else {
		return false;
	}
};

/**
 * Remove a File instance from the cache by 'filepath'
 * @param {String} filepath
 */
Source.prototype.remove = function(filepath) {
	filepath = path.resolve(filepath);
	var file = this.byPath[filepath];
	if (file) {
		this.length--;
		delete this.byPath[filepath];
		delete this.byModule[file.moduleID];
		file.destroy();
	}
};

/**
 * Watch for changes and call 'fn'
 * @param {Function} fn(err, file)
 */
Source.prototype.watch = function(fn) {
	var self = this;
	this.locations.forEach(function(location) {
		var watcher;
		print("watching "
			+ (strong(path.relative(process.cwd(), location)))
			+ "...", 3);
		self._watchers.push(watcher = new Watcher(ignored));
		// Add file on 'create'
		watcher.on('create', function(filepath, stats) {
			self.add(filepath);
			print("["
				+ (new Date().toLocaleTimeString())
				+ "] "
				+ (colour('added', notify.GREEN))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
		});
		// Remove file on 'delete'
		watcher.on('delete', function(filepath) {
			self.remove(filepath);
			print("["
				+ (new Date().toLocaleTimeString())
				+ "] "
				+ (colour('removed', notify.RED))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
		});
		// Notify when 'change'
		// Return File instance
		watcher.on('change', function(filepath, stats) {
			var file;
			print("["
				+ (new Date().toLocaleTimeString())
				+ "] "
				+ (colour('changed', notify.YELLOW))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
			file = self.byPath[filepath];
			fn(null, file);
		});
		// Notify when 'error'
		watcher.on('error', function(err) {
			fn(err);
		});
		// Watch
		watcher.watch(location);
		// Start reloader
		if (self.options.reload) {
			reloader.start(function(err) {
				fn(err);
			});
		}
	});
};

/**
 * Reload 'file'
 * @param {String} file
 */
Source.prototype.refresh = function(file) {
	if (this.options.reload) {
		reloader.refresh(file);
	}
};

/**
 * Clean up
 */
Source.prototype.clean = function() {
	return reloader.stop();
};

/**
 * Get base path for 'filepath'
 * @param {String} filepath
 */
Source.prototype._getBasepath = function(filepath) {
	var location;
	for (var i = 0, n = this.locations.length; i < n; ++i) {
		location = this.locations[i];
		if (indir(location, filepath)) {
			return location;
		}
	}
	// Check in project root
	return (indir(process.cwd(), filepath)) ? process.cwd() : null;
};
