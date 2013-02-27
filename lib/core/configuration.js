var fs = require('fs')
	, path = require('path')
	, existsSync = require('recur-fs').existsSync
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong;

var DEFAULT = 'buddy.js'
	, DEFAULT_JSON = 'buddy.json'
	, DEFAULT_PACKAGE_JSON = 'package.json';

exports.data = null;

exports.url = '';

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} url
 * @param {Function} fn(err, config)
 */
exports.load = function(url, fn) {
	debug('CONFIGURATION', 1);
	locate(url, function(err) {
		var data;
		if (err) return fn(err);
		try {
			data = require(exports.url);
			// Package.json location
			if (data.buddy) data = data.buddy;
		} catch (e) {
			return fn("parsing " + (strong(exports.url)) + "\n  Run " + (strong('buddy -h')) + " for proper formatting");
		}
		if (data.build || data.dependencies || data.settings) {
			// Store
			exports.data = data;
			// Set current directory to location of file
			process.chdir(path.dirname(exports.url));
			return fn(null, data);
		} else {
			return fn("parsing " + (strong(exports.url)) + "\n  Run " + (strong('buddy -h')) + " for proper formatting");
		}
	});
};

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {Function} fn(err, url)
 */
var locate = exports.locate = function(url, fn) {
	var dir, parent, urljs, urljson, urlpkgjson;
	if (url) {
		// Check that the supplied path is valid
		url = path.resolve(url);
		if (existsSync(url)) {
			fs.stat(url, function(err, stats) {
				if (err) return fn(err);
				// Try default file name if passed directory
				if (!path.extname(url).length || stats.isDirectory()) {
					// Support both js and json file types
					urljs = path.join(url, DEFAULT);
					urljson = path.join(url, DEFAULT_JSON);
					urlpkgjson = path.join(url, DEFAULT_PACKAGE_JSON);
					if (existsSync(url = urljs) || existsSync(url = urljson) || existsSync(url = urlpkgjson)) {
						debug("config file found at: " + (strong(url)), 2);
						exports.url = url;
						fn(null, url);
					} else {
						return fn("" + (strong(path.basename(url))) + " not found in " + (strong(path.dirname(url))));
					}
				} else {
					debug("config file found at: " + (strong(url)), 2);
					exports.url = url;
					fn(null, url);
				}
			});
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
					return fn("" + (strong(DEFAULT)) + " not found on this path");
				} else {
					// Start at current working directory
					dir = parent;
				}
			} else {
				dir = process.cwd();
			}
			// Support both js and json file types
			urljs = path.join(dir, DEFAULT);
			urljson = path.join(dir, DEFAULT_JSON);
			urlpkgjson = path.join(dir, DEFAULT_PACKAGE_JSON);
			if (existsSync(url = urljs) || existsSync(url = urljson) || existsSync(url = urlpkgjson)) {
				debug("config file found at: " + (strong(url)), 2);
				exports.url = url;
				return fn(null);
			}
		}
	}
};
