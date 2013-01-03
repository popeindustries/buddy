var path = require('path')
	, fs = require('fs')
	, bower = require('bower')
	, request = require('superagent')
	, http = require('http')
	, unzip = require('unzip')
	, semver = require('semver')
	, async = require('async')
	, fsutils = require('../utils/fs')
	, notify = require('../utils/notify')
	, debug = notify.debug
	, strong = notify.strong
	, rm = fsutils.rm
	, mv = fsutils.mv
	, cp = fsutils.cp
	, mkdir = fsutils.mkdir
	, existsSync = fsutils.existsSync;

var RE_GITHUB_PROJECT = /\w+\/\w+/
	, RE_GITHUB_URL = /git:\/\/(.*)\.git/
	, RE_PACKAGE_NOT_FOUND = /was not found/
	, RE_INDEX = /^index(?:\.js$)?/
	, RE_VALID_VERSION = /^\d+\.\d+\.\d+$|^master$/;

// var Dependency, RE_GITHUB_PROJECT, RE_GITHUB_URL, RE_INDEX, RE_PACKAGE_NOT_FOUND, RE_VALID_VERSION, async, bower, cp, debug, existsSync, fs, fsutils, http, mkdir, mv, path, request, rm, semver, strong, unzip, _ref, _ref1,
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Dependency;

/**
 * Constructor
 * @param {String} source
 * @param {String} destination
 * @param {String} output
 * @param {String} temp
 */
function Dependency(source, destination, output, temp) {
	debug("created Source instance for: " + source, 2);
	this.move = __bind(this.move, this);
	this.resolveResources = __bind(this.resolveResources, this);
	this.fetch = __bind(this.fetch, this);
	this.validateVersion = __bind(this.validateVersion, this);
	this.lookupPackage = __bind(this.lookupPackage, this);
	this.temp = temp;
	this.local = false;
	this.keep = false;
	this.id = source;
	this.name = source;
	this.url = null;
	this.version = 'master';
	this.packageFiles = ['component.json', 'package.json'];
	this.location = null;
	this.resources = null;
	this.files = [];
	this.dependencies = [];
	this.destination = path.resolve(destination);
	this.output = output && path.resolve(output);

	// Parse specified resources
	source = source.split('#');
	if (source[1]) this.resources = source[1].split('|');
	// Local
	if (existsSync(path.resolve(source[0]))) {
		this.local = true;
		this.location = path.resolve(source[0]);
		if (this.resources == null) this.resources = [this.location];
		// Don't clean if source is in destination dir
		this.keep = this.location.indexOf(path.resolve(this.destination)) != -1;
	// Remote
	} else {
		// Parse version
		source = source[0].split('@');
		if (source[1]) this.version = source[1];
		this.id = this.name = source[0];
		// github user/repo
		if (RE_GITHUB_PROJECT.test(this.name)) {
			this.url = "https://github.com/" + this.name + "/archive/" + this.version + ".zip";
			this.id = this.name.split('/')[1];
		}
	}
}

/**
 * Install the dependency
 * @param {Function} fn(err, dependencies)
 */
Dependency.prototype.install = function(fn) {
	var self = this;
	if (this.local) {
		this.move(function(err) {
			if (err) return fn(err);
			else return fn(null, self.dependencies);
		});
	} else {
		async.series([
			this.lookupPackage,
			this.validateVersion,
			this.fetch,
			this.resolveResources,
			this.move
		], function(err) {
			if (err) return fn(err);
			else return fn(null, self.dependencies);
		});
	}
};

/*
 * Lookup a Bower package's github location
 * @param {Function} fn(err)
 */
Dependency.prototype.lookupPackage = function(fn) {
	var self = this;
	if (!this.url) {
		debug("looking up package: " + (strong(this.id)), 3);
		bower.commands
			.lookup(this.id)
			// Error looking up package
			.on('error', function() {
				fn('no package found for:' + self.id);
			})
			.on('data', function(data) {
				// Error looking up package
				if (RE_PACKAGE_NOT_FOUND.test(data)) {
					fn('no package found for:' + self.id);
				} else {
					// Store archive url
					var url = RE_GITHUB_URL.exec(data)[1];
					self.name = url.replace('github.com/', '');
					self.url = "https://" + url + "/archive/" + self.version + ".zip";
					fn();
				}
			});
	} else {
		// Delay for event chaining
		process.nextTick(function() {
			fn();
		});
	}
};

/**
 * Retrieve the latest version that satisfies a conditional version number
 * @param {Function} fn(err)
 */
Dependency.prototype.validateVersion = function(fn) {
	var req
		, self = this;
	if (!RE_VALID_VERSION.test(this.version)) {
		debug("validating version: " + (strong(this.name + '@' + this.version)), 3);
		// Get tags
		req = request.get("https://api.github.com/repos/" + this.name + "/tags");
		req.end(function(err, res) {
			var json, version;
			// Error downloading
			if (err || res.error) {
				fn('fetching tags for: ' + self.name + ' failed with error code: ' + http.STATUS_CODES[res.status]);
			} else {
				// Parse and sort json data
				try {
					json = JSON.parse(res.text);
				} catch (e) {
					fn('parsing tag information for: ' + self.name);
				}
				// Sort by version (name) descending
				json.sort(function(a, b) {
					return semver.rcompare(a.name, b.name);
				});

				// Set latest version
				if (self.version === '*' || self.version === 'latest') {
					self.version = json[0].name;
					self.url = json[0].zipball_url;
				// Match version
				} else {
					for (var i = 0, n = json.length; i < n; ++i) {
						version = json[i];
						// Find the highest version that passes
						if (semver.satisfies(version.name, self.version)) {
							self.version = version.name;
							self.url = version.zipball_url;
							break;
						}
					}
				}
				fn();
			}
		});
	} else {
		// Delay for event chaining
		process.nextTick(function() {
			fn();
		});
	}
};

/**
 * Fetch the github archive zipball to 'temp' directory
 * @param {Function} fn(err)
 */
Dependency.prototype.fetch = function(fn) {
	var self = this
		// Create archive filename
		, filename = this.temp + path.sep + this.id + '-' + this.version + '.zip'
		// Download archive to temp
		, req = request.get(this.url).buffer(false);
	debug("downloading zipball to temp: " + (strong(this.url)), 3);
	req.end(function(err, res) {
		// Error downloading
		if (err || res.error) {
			fn('fetching ' + self.url + ' failed with error code: ' + http.STATUS_CODES[res.status]);
		} else {
			// Write to disk
			res.pipe(fs.createWriteStream(filename));
			res.on('end', function() {
				// Unzip
				var extractor = unzip.Extract({path: self.temp});
				fs.createReadStream(filename).pipe(extractor);
				// Error unzipping
				extractor.on('error', function() {
					fn('unzipping archive: ' + filename);
				});
				// Store path to unzipped package
				extractor.on('close', function() {
					self.location = filename.replace(path.extname(filename), '');
					fn();
				});
			});
		}
	});
};

/**
 * Parse archive component.json or package.json for resources and dependencies
 * @param {Function} fn(err)
 */
Dependency.prototype.resolveResources = function(fn) {
	var temp, callback,
		self = this;

	// Find 'main' property in json file
	var find = function(packageFile, cb) {
		var filename;
		if (existsSync(filename = path.resolve(self.location, packageFile))) {
			fs.readFile(filename, 'utf8', function(err, data) {
				var json;
				if (err) return cb('reading: ' + self.id + ' ' + packageFile);
				try {
					json = JSON.parse(data);
				} catch (e) {
					// Error parsing json
					return cb('parsing: ' + self.id + ' ' + packageFile);
				}
				// Return
				cb(null, json);
			});
		} else {
			cb(null);
		}
	};

	// Add file to resources
	var add = function(filename) {
		var filepath;
		// Rename if index
		if (RE_INDEX.test(filename)) {
			if (!path.extname(filename)) filename += '.js';
			var newname = self.id + '.js';
			// TODO: async rename
			// TODO: parse contents for require redirect
			// Rename to package name
			fs.renameSync(path.resolve(self.location, filename), path.resolve(self.location, newname));
			filename = newname;
		}
		filepath = path.resolve(self.location, filename);
		debug("added resource: " + (strong(path.basename(filepath))), 3);
		if (existsSync(filepath)) self.resources.push(filepath);
	};

	// Resources specified
	if (this.resources) {
		// Store resources with absolute paths
		temp = this.resources.concat();
		this.resources = [];
		temp.forEach(function(filename) {
			add(filename);
		});
		// Delay for event chaining
		process.nextTick(function() {
			fn();
		});
	} else {
		this.resources = [];
		// Find first json file that has a 'main' property
		find(this.packageFiles.pop(), callback = function(err, json) {
			var version;
			if (err) return fn(err);
			if (json && json.main) {
				add(json.main);
				// Find dependencies and store
				if (json.dependencies) {
					for (var dependency in json.dependencies) {
						version = json.dependencies[dependency];
						self.dependencies.push("" + dependency + "@" + version);
					}
				}
				// Return
				fn();
			// Try next
			} else if (self.packageFiles.length) {
				find(self.packageFiles.pop(), callback);
			} else {
				return fn('unable to resolve resources for: ' + self.id);
			}
		});
	}
};

/**
 * Move resources to destination
 * @param {Function} fn(err)
 */
Dependency.prototype.move = function(fn) {
	var idx,
		self = this;
	if (!this.keep) {
		idx = -1;
		async.forEachSeries(this.resources, (function(resource, cb) {
			// Copy local files, otherwise move
			fsutils[self.local ? 'cp' : 'mv'](resource, self.destination, true, function(err, filepath) {
				if (err) return cb(err);
				idx++;
				self.files.push(path.relative(process.cwd(), filepath));
				debug("moved resource " + (strong(path.basename(resource))) + " to destination " + (strong(path.relative(process.cwd(), self.destination))), 3);
				self.resources[idx] = filepath;
				cb();
			});
		}), function(err) {
			if (err) return fn(err);
			else return fn();
		});
	} else {
		// Delay for event chaining
		process.nextTick(function() {
			fn();
		});
	}
};

Dependency.prototype.destroy = function() {};
