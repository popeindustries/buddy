var path = require('path')
	, Watcher = require('yaw')
	, fileFactory = require('./file')
	, reloader = require('../utils/reloader')
	, object = require('../utils/object')
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong
	, print = term.print
	, colour = term.colour
	, fsutils = require('recur-fs')
	, indir = fsutils.indir
	, readdir = fsutils.readdir
	, existsSync = fsutils.existsSync;

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
	this.ignoredLocations = {};
	sources.forEach(function(source) {
		// Store ignored locations
		if (source.indexOf('!') == 0) {
			source = source.slice(1);
			self.ignoredLocations[path.resolve(source)] = true;
		} else {
			self.locations.push(path.resolve(source));
		}
	});
}

/**
 * Parse sources, generating File instances for valid files
 * @param {Function} fn(err)
 */
Source.prototype.parse = function(fn) {
	var outstanding = 0
		, self = this
		, invalid;
	this.locations.forEach(function(location) {
		outstanding++;
		readdir(location, null, null, function(err, files) {
			outstanding--;
			if (err) return fn(err);
			files.forEach(function(f) {
				// Skip files in ignored locations
				invalid = false;
				for (var ignoredLocation in self.ignoredLocations) {
					if (f.indexOf(ignoredLocation) != -1) {
						invalid = true;
						break;
					}
				}
				if (!invalid) self.add(f);
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
		self._watchers.push(watcher = new Watcher());
		// Add file on 'create'
		watcher.on('create', function(filepath, stats) {
			self.add(filepath);
			print("["
				+ (new Date().toLocaleTimeString())
				+ "] "
				+ (colour('added', term.GREEN))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
		});
		// Remove file on 'delete'
		watcher.on('delete', function(filepath) {
			self.remove(filepath);
			print("["
				+ (new Date().toLocaleTimeString())
				+ "] "
				+ (colour('removed', term.RED))
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
				+ (colour('changed', term.YELLOW))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
			file = self.byPath[filepath];
			fn(null, file);
		});
		// Notify when 'error'
		watcher.on('error', fn);
		// Watch
		watcher.watch(location);
	});
};

/**
 * Reload 'file'
 * @param {String} file
 */
Source.prototype.refresh = function(file) {
	if (this.options.reloadServer) reloadServer.refresh(file);
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
