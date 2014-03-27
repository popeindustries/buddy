var fs = require('fs')
	, path = require('path')
	, lodash = require('lodash')
	, extend = lodash.extend
	, clone = lodash.clone
	, unique = lodash.unique
	, alias = require('identify-resource').alias
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
			script: false,
			lazy: false,
			reload: false,
			serve: false,
			watch: false,
			deploy: false,
			verbose: false}
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080}
	, DEFAULT_SOURCES = {
			js: ['.'],
			css: ['.'],
			html: ['.']}
	, FILE_EXTENSIONS = {
			js: ['js', 'coffee', 'hbs', 'handlebars', 'dust', 'jade'],
			css: ['css', 'styl', 'less'],
			html: ['html', 'jade', 'twig', 'dust', 'handlebars', 'hbs']};

exports.data = {runtimeOptions:{}};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} [url]
 * @param {Object} [runtimeOptions]
 * @param {Function} fn(err, config)
 */
exports.load = function(url, runtimeOptions, fn) {
	if (!fn && 'function' == typeof runtimeOptions) {
		fn = runtimeOptions;
		runtimeOptions = {};
	}

	exports.locate(url, function(err, url) {
		if (err) return fn(err);
		try {
			var data = require(url);
			// Package.json location
			if (data.buddy) data = data.buddy;
			// Set current directory to location of file
			process.chdir(path.dirname(url));
			// Backwards compatible refactor of deprecated 'settings'
			if (data.settings) {
				data.server = data.settings.server;
				// Backwards compatibile refactor of deprecated 'test'
				data.script = data.settings.test || data.settings.script;
			}
			// Override default runtimeOptions and store
			exports.data.runtimeOptions = extend({}, DEFAULT_OPTIONS, runtimeOptions);
			// Backwards compatibile refactor of deprecated 'test'
			if (runtimeOptions.test != null) exports.data.runtimeOptions.script = runtimeOptions.test;
			exports.data.url = url;
			exports.data.fileExtensions = FILE_EXTENSIONS;
			exports.data.server = extend({}, DEFAULT_SERVER, data.server);
			exports.data.script = data.script;
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
			target.fileExtensions = FILE_EXTENSIONS[type];
			if (target.modular == null) target.modular = true;
			// Store hooks
			if (target.before) target.before = defineHook(target.before);
			if (target.afterEach) target.afterEach = defineHook(target.afterEach);
			if (target.after) target.after = defineHook(target.after);
			// Register aliases
			if (target.alias) alias(target.alias);
			if (target.type != 'js' || (target.type == 'js' && !target.modular)) {
				target.bootstrap = target.boilerplate = false;
			}

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

			// Generate processing workflow
			processWorkflow(type, target);

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

/**
 * Determine processing workflow (context:command)
 * @param {String} type
 * @param {Target} target
 */
function processWorkflow (type, target) {
	target.workflow = [];
	if (type == 'html') {
		target.workflow.push('file:compile', 'file:concat', 'target:write');
		// target.workflow.push('file:parse', 'target:resolve', 'file:concat', 'target:filter', 'file:compile');
	} else if (type == 'css') {
		// Resolve dependencies even if directory for css
		if (target.runtimeOptions.lint) target.workflow.push('file:lint');
		target.workflow.push('file:parse', 'target:resolve', 'file:concat', 'target:filter', 'file:compile');
		if (target.runtimeOptions.compress) target.workflow.push('file:compress');
		target.workflow.push('target:write');
	} else {
		if (target.isDir) {
			if (target.runtimeOptions.lint) target.workflow.push('file:lint');
			target.workflow.push('file:compile');
			if (target.modular) {
				target.workflow.push('file:replace');
				target.workflow.push('file:wrap');
			}
			if (target.runtimeOptions.compress) target.workflow.push('file:compress');
			target.workflow.push('target:write');
		} else {
			if (target.runtimeOptions.lint) target.workflow.push('file:lint');
			target.workflow.push('file:compile');
			if (target.modular) {
				target.workflow.push('file:parse');
				target.workflow.push('file:replace');
				if (target.runtimeOptions.lazy) {
					if (target.runtimeOptions.compress) target.workflow.push('file:compress');
					target.workflow.push('file:escape');
				}
				target.workflow.push('file:wrap');
				target.workflow.push('target:resolve');
				target.workflow.push('file:concat');
			}
			if (target.runtimeOptions.compress) target.workflow.push('file:compress');
			target.workflow.push('target:write');
		}
	}
}

/**
 * Convert hook path or expression to Function
 * @param {String} hook
 * @returns {Function}
 */
function defineHook (hook) {
	var hookpath;
	// Load file content if filepath
	if (fs.existsSync(hookpath = path.resolve(hook))) {
		hook = fs.readFileSync(hookpath, 'utf8');
	}
	return new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', hook);
}
