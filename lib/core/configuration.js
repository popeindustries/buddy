var fs = require('fs')
	, path = require('path')
	, lodash = require('lodash')
	, extend = lodash.extend
	, clone = lodash.clone
	, unique = lodash.unique
	, term = require('buddy-term')
	, warn = term.warn
	, debug = term.debug
	, strong = term.strong;

var DEFAULT_JS = 'buddy.js'
	, DEFAULT_JSON = 'buddy.json'
	, DEFAULT_PACKAGE_JSON = 'package.json'
	, DEFAULT_OPTIONS = {
		compress: false,
		lint: false,
		test: false,
		lazy: false,
		reload: false,
		serve: false,
		watch: false,
		deploy: false,
		verbose: false
	}
	, DEFAULT_SOURCES = {
		js: ['node_modules'],
		css: [],
		html: []
	}
	, FILE_EXTENSIONS = {
		js: ['js', 'coffee', 'ls', 'hbs', 'handlebars'],
		css: ['css', 'styl', 'less'],
		html: ['html', 'jade']
	}
	, FILE_FILTERS = {
		js: /\.js$|\.coffee$|\.ls$|\.hbs$|\.handlebars$/,
		css: /\.css$|\.styl$|\.less$/,
		html: /\.html$|\.jade$/
	};

exports.data = {};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} [url]
 * @param {Object} [options]
 * @param {Function} fn(err, config)
 */
exports.load = function(url, options, fn) {
	debug('CONFIGURATION', 1);
	if (!fn && 'function' == typeof options) {
		fn = options;
		options = {};
	}
	exports.locate(url, function(err, url) {
		if (err) return fn(err);
		debug("config file found at: " + (strong(url)), 2);
		try {
			var data = require(url);
			// Package.json location
			if (data.buddy) data = data.buddy;
			// Set current directory to location of file
			process.chdir(path.dirname(url));
			// Override default options and store
			exports.data.options = extend({}, DEFAULT_OPTIONS, options);
			exports.data.url = url;
			exports.data.fileFilters = FILE_FILTERS;
			exports.data.fileExtensions = FILE_EXTENSIONS;
			exports.data.settings = data.settings;
			// Validate
			if (data.build || data.dependencies) {
				// Store
				exports.data.build = exports.parse(data.build);
				exports.data.dependencies = data.dependencies;
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
 * @param {String} [url]
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

/**
 * Parse and validate config "data"
 * @param {Object} data
 * @returns {Object}
 */
exports.parse = function(data) {
	var build = {};
	build.sources = [];
	build.targets = [];

	var _parse = function(type, sources, targets) {
		var valid = [];
		targets.forEach(function(target) {
			target.type = type;
			target.sources = sources;
			target.inputpath = path.resolve(target.input);
			target.outputpath = path.resolve(target.output);
			target.outputpathCompressed = target.output_compressed
				? path.resolve(target.output_compressed)
				: target.outputpath;
			target.options = clone(exports.data.options || {});
			target.fileFilter = FILE_FILTERS[type];
			target.fileExtensions = FILE_EXTENSIONS[type];
			var isOutputFile = path.extname(target.outputpath).length;
			// Abort if input doesn't exist
			if (!fs.existsSync(target.inputpath)) {
				return warn("" + strong(target.input) + " doesn\'t exist");
			}
			// Default
			if (target.modular == null) target.modular = true;
			target.isDir = fs.statSync(target.inputpath).isDirectory();
			// Abort if input is directory and output is file
			if (target.isDir && isOutputFile) {
				return warn("a file ("
					+ (strong(target.output))
					+ ") is not a valid output target for a directory ("
					+ (strong(target.input))
					+ ") input target");
			// Resolve default output file name for file>directory target
			} else if (!target.isDir && !isOutputFile) {
				target.outputpath = path.join(target.outputpath, path.basename(target.inputpath)).replace(path.extname(target.inputpath), "." + type);
			}
			// Generate processing steps
			target.steps = [];
			if (type == 'html') {
				target.steps.push('transfigure', 'write');
			} else if (type == 'css') {
				// Resolve dependencies even if directory for css
				target.steps.push('resolve', 'concat', 'transfigure');
				if (target.options.compress) target.steps.push('compress');
				target.steps.push('write');
			} else {
				if (target.isDir) {
					target.steps.push('transfigure');
					if (target.modular) target.steps.push('wrap');
					if (target.options.compress) target.steps.push('compress');
					target.steps.push('write');
				} else {
					target.steps.push('transfigure');
					if (target.modular) {
						target.steps.push('resolve');
						if (target.options.lazy) target.steps.push('escape');
						if (target.options.lazy && target.options.compress) target.steps.push('compress');
						target.steps.push(target.options.lazy ? 'wrapLazy' : 'wrap', 'concat');
					}
					if (target.options.compress) target.steps.push('compress');
					target.steps.push('write');
				}
			}
			// Traverse child targets
			if (target.targets) {
				target.hasChildren = true;
				target.targets = _parse(type, sources, target.targets);
			}
			// Store
			valid.push(target);
		});
		return valid;
	};

	// Loop through 'js/css/html'
	for (var type in data) {
		var b = data[type]
			// Merge sources with defaults
			// Use current directory if none passed
			, sources = DEFAULT_SOURCES[type].concat(b.sources || ['.']).map(function(source) {
				return path.resolve(source);
			});
		// Validate
		if (b
			&& b.targets
			&& b.targets.length) {
				// Store sources
				build.sources = build.sources.concat(sources);
				// Store targets
				build.targets = build.targets.concat(_parse(type, sources, b.targets));
		} else {
			warn('invalid build configuration');
		}
	}

	build.sources = unique(build.sources);
	// Return nothing if validation errors
	return build.targets.length ? build : null;
};
