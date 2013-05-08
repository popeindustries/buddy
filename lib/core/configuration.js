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
			verbose: false}
	, DEFAULT_SETTINGS = {
			server: {
				directory: '.',
				port: 8080}}
	, DEFAULT_SOURCES = {
			js: ['node_modules', '.'],
			css: ['.'],
			html: ['.']}
	, FILE_EXTENSIONS = {
			js: ['js', 'coffee', 'ls', 'hbs', 'handlebars'],
			css: ['css', 'styl', 'less'],
			html: ['html', 'jade']}
	, FILE_FILTERS = {
			js: /\.js$|\.coffee$|\.ls$|\.hbs$|\.handlebars$/,
			css: /\.css$|\.styl$|\.less$/,
			html: /\.html$|\.jade$/};

exports.data = {runtimeOptions:{}};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} [url]
 * @param {Object} [runtimeOptions]
 * @param {Function} fn(err, config)
 */
exports.load = function(url, runtimeOptions, fn) {
	// debug('CONFIGURATION', 1);
	if (!fn && 'function' == typeof runtimeOptions) {
		fn = runtimeOptions;
		runtimeOptions = {};
	}
	exports.locate(url, function(err, url) {
		if (err) return fn(err);
		// debug("config file found at: " + (strong(url)), 2);
		try {
			var data = require(url);
			// Package.json location
			if (data.buddy) data = data.buddy;
			// Set current directory to location of file
			process.chdir(path.dirname(url));
			// Override default runtimeOptions and store
			exports.data.runtimeOptions = extend({}, DEFAULT_OPTIONS, runtimeOptions);
			exports.data.url = url;
			exports.data.fileFilters = FILE_FILTERS;
			exports.data.fileExtensions = FILE_EXTENSIONS;
			exports.data.settings = extend({}, DEFAULT_SETTINGS, data.settings);
			// Validate
			if (data.build || data.dependencies) {
				// Store
				if (data.build) {
					exports.data.build = exports.parse(data.build, exports.data.runtimeOptions, exports.data.cache);
					// Error parsing
					if (!exports.data.build) throw 'invalid "build" data for ' + strong(url);
				}
				exports.data.dependencies = data.dependencies;
				return fn(null, exports.data);
			} else {
				throw 'no "build" or "dependencies" data for ' + strong(url);
			}
		} catch (e) {
			return fn(e);
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
 * Parse and validate config 'data'
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
			target.runtimeOptions = clone(exports.data.runtimeOptions);
			target.sources = sources;
			target.inputPath = path.resolve(target.input);
			target.outputPath = target.runtimeOptions.compress && target.output_compressed
				? path.resolve(target.output_compressed)
				: path.resolve(target.output);
			target.fileFilter = FILE_FILTERS[type];
			target.fileExtensions = FILE_EXTENSIONS[type];
			if (target.modular == null) target.modular = true;

			var isOutputFile = path.extname(target.outputPath).length;
			// Abort if input doesn't exist
			if (!fs.existsSync(target.inputPath)) {
				return warn("" + strong(target.input) + " doesn\'t exist");
			}
			target.isDir = fs.statSync(target.inputPath).isDirectory();
			// Abort if input is directory and output is file
			if (target.isDir && isOutputFile) {
				return warn("a file ("
					+ (strong(target.output))
					+ ") is not a valid output target for a directory ("
					+ (strong(target.input))
					+ ") input target");
			// Resolve default output file name for file>directory target
			} else if (!target.isDir && !isOutputFile) {
				target.outputPath = path.join(target.outputPath, path.basename(target.inputPath)).replace(path.extname(target.inputPath), "." + type);
			}

			// Generate grouped processing workflow (context:command)
			target.workflow = [];
			if (type == 'html') {
				target.workflow.push('compile', 'concat', 'target:write');
			} else if (type == 'css') {
				// Resolve dependencies even if directory for css
				if (target.runtimeOptions.lint) target.workflow.push('lint');
				target.workflow.push('parse', 'target:resolve', 'concat', 'target:filter', 'compile');
				if (target.runtimeOptions.compress) target.workflow.push('compress');
				target.workflow.push('target:write');
			} else {
				if (target.isDir) {
					if (target.runtimeOptions.lint) target.workflow.push('lint');
					target.workflow.push('compile');
					if (target.modular) {
						if (target.runtimeOptions.deploy) {
							target.workflow.push('parse');
							target.workflow.push('replace');
						}
						target.workflow.push('wrap');
					}
					if (target.runtimeOptions.compress) target.workflow.push('compress');
					target.workflow.push('target:write');
				} else {
					if (target.runtimeOptions.lint) target.workflow.push('lint');
					target.workflow.push('compile');
					if (target.modular) {
						target.workflow.push('parse');
						if (target.runtimeOptions.deploy) target.workflow.push('replace');
						if (target.runtimeOptions.lazy) {
							if (target.runtimeOptions.compress) target.workflow.push('compress');
							target.workflow.push('escape');
						}
						target.workflow.push('wrap');
						target.workflow.push('target:resolve');
						target.workflow.push('concat');
					}
					if (target.runtimeOptions.compress) target.workflow.push('compress');
					target.workflow.push('target:write');
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
			, sources = (b.sources || []).concat(DEFAULT_SOURCES[type]).map(function(source) {
				return path.resolve(source);
			});
		// Validate
		if (b && b.targets && b.targets.length) {
			// Store sources
			build.sources = build.sources.concat(sources);
			// Store targets
			build.targets = build.targets.concat(_parse(type, sources, b.targets));
		} else {
			warn('invalid build configuration: ' + strong(type));
		}
	}

	build.sources = unique(build.sources);
	// Return nothing if validation errors
	return build.targets.length ? build : null;
};
