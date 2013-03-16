var fs = require('fs')
	, path = require('path')
	, term = require('buddy-term')
	, warn = term.warn
	, debug = term.debug
	, strong = term.strong;

var DEFAULT_JS = 'buddy.js'
	, DEFAULT_JSON = 'buddy.json'
	, DEFAULT_PACKAGE_JSON = 'package.json';

exports.data = {};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} url
 * @param {Function} fn(err, config)
 */
exports.load = function(url, fn) {
	debug('CONFIGURATION', 1);
	exports.locate(url, function(err, url) {
		if (err) return fn(err);
		debug("config file found at: " + (strong(url)), 2);
		try {
			var data = require(url);
			// Package.json location
			if (data.buddy) data = data.buddy;
			// Set current directory to location of file
			process.chdir(path.dirname(url));
			// Validate
			if (data.build || data.dependencies || data.settings) {
				// Store
				exports.data.build = exports.parse(data.build) || null;
				exports.data.dependencies = data.dependencies || null;
				exports.data.settings = data.settings || null;
				exports.data.url = url;
				return fn(null, exports.data);
			} else {
				throw '';
			}
		} catch (e) {
			return fn("parsing " + (strong(url)));
		}
	});
};

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {Function} fn(err, url)
 */
exports.locate = function(url, fn) {
	var dir, parent, urljs, urljson, urlpkgjson;
	if (url) {
		// Check that the supplied path is valid
		if (fs.existsSync(url = path.resolve(url))) {
			// Try default file name if passed directory
			if (!path.extname(url).length || fs.statSync(url).isDirectory()) {
				// Support js, json, and package.json
				urljs = path.join(url, DEFAULT_JS);
				urljson = path.join(url, DEFAULT_JSON);
				urlpkgjson = path.join(url, DEFAULT_PACKAGE_JSON);
				if (!(fs.existsSync(url = urljs) || fs.existsSync(url = urljson) || fs.existsSync(url = urlpkgjson))) {
					return fn("" + (strong(path.basename(url))) + " not found in " + (strong(path.dirname(url))));
				}
			}
			return fn(null, url);
		} else {
			return fn("" + (strong(path.basename(url))) + " not found in " + (strong(path.dirname(url))));
		}

	// No url specified
	// Find the first instance of a DEFAULT file based on the current working directory
	} else {
		while (true) {
			if (typeof dir !== "undefined" && dir !== null) {
				parent = path.resolve(dir, '../');
				// Exit if we can no longer go up a level
				if (parent === dir) {
					return fn("" + strong(DEFAULT_JS + '|' + DEFAULT_JSON + '|' + DEFAULT_PACKAGE_JSON) + " not found on this path");
				} else {
					// Start at current working directory
					dir = parent;
				}
			} else {
				dir = process.cwd();
			}
			// Support js, json, and package.json
			urljs = path.join(dir, DEFAULT_JS);
			urljson = path.join(dir, DEFAULT_JSON);
			urlpkgjson = path.join(dir, DEFAULT_PACKAGE_JSON);
			if (fs.existsSync(url = urljs) || fs.existsSync(url = urljson) || fs.existsSync(url = urlpkgjson)) {
				return fn(null, url);
			}
		}
	}
};

exports.parse = function(data) {
	var build = {};
	build.sources = [];
	build.targets = [];

	var _parse = function(type, targets) {
		var valid = [];
		targets.forEach(function(target) {
			var inputpath = target.inputpath = path.resolve(target.input)
				, outputpath = target.outputpath = path.resolve(target.output)
				, isInputDir, isOutputFile;
			// Skip if input doesn't exist
			if (!fs.existsSync(inputpath)) {
				return warn("" + strong(target.input) + " doesn\'t exist");
			}
			isInputDir = target.isDir = fs.statSync(inputpath).isDirectory();
			isOutputFile = path.extname(outputpath).length;
			// Skip if input is directory and output is file
			if (isInputDir && isOutputFile) {
				return warn("a file ("
					+ (strong(target.output))
					+ ") is not a valid output target for a directory ("
					+ (strong(target.input))
					+ ") input target");
			// Resolve default output file name for file>directory target
			} else if (!isInputDir && !isOutputFile) {
				target.outputpath = path.join(outputpath, path.basename(inputpath)).replace(path.extname(inputpath), "." + type);
			}
			// Traverse child targets
			if (target.targets) target.targets = _parse(type, target.targets);
			// Store
			valid.push(target);
		});
		return valid;
	};

	for (var type in data) {
		var b = data[type];
		// Validate
		if (b
			&& b.sources
			&& b.sources.length
			&& b.targets
			&& b.targets.length) {
				// Store sources
				b.sources.forEach(function(source) {
					build.sources.push(path.resolve(source));
				});
				// Store targets
				build.targets = _parse(type, b.targets);
		}
	}

	console.log(build);
	return targets.length ? build : null;
};
