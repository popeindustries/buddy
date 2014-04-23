var fs = require('fs')
	, path = require('path')
	, lodash = require('lodash')
	, extend = lodash.extend
	, clone = lodash.clone
	, unique = lodash.unique
	, alias = require('identify-resource').alias
	, cnsl = require('../utils/cnsl')
	, warn = cnsl.warn
	, debug = cnsl.debug
	, strong = cnsl.strong;

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
			verbose: false,
			targets: ['js','css','html']}
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080}
	, DEFAULT_SOURCES = {
			js: ['.'],
			css: ['.'],
			html: ['.']}
	, FILE_EXTENSIONS = {
			js: ['js', 'json', 'coffee', 'hbs', 'handlebars', 'dust', 'jade'],
			css: ['css', 'styl', 'less'],
			html: ['html', 'jade', 'twig', 'dust', 'handlebars', 'hbs']};

exports.data = {runtimeOptions:{}};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String} [url]
 * @param {Object} [runtimeOptions]
 * @returns {Object}
 */
exports.load = function (url, runtimeOptions) {
	if (typeof url == "object") runtimeOptions = url;
	runtimeOptions = runtimeOptions || {};

	var url = exports.locate(url)
		, data = require(url);

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
			if (!exports.data.build) throw new Error('invalid "build" data for ' + strong(url));
		}
		exports.data.dependencies = data.dependencies;
		return exports.data;
	} else {
		throw new Error('no "build" or "dependencies" data for ' + strong(url));
	}

	return data;
};

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
exports.locate = function (url) {
	function check (dir) {
			// Support js, json, and package.json
		var urljs = path.join(dir, DEFAULT_JS)
			, urljson = path.join(dir, DEFAULT_JSON)
			, urlpkgjson = path.join(dir, DEFAULT_PACKAGE_JSON)
			, url;

		if (fs.existsSync(url = urljs)
			|| fs.existsSync(url = urljson)
			|| fs.existsSync(url = urlpkgjson)) {
				return url;
		} else {
			return '';
		}
	}

	var dir, parent;
	if (url) {
		// Check that the supplied path is valid
		if (fs.existsSync(url = path.resolve(url))) {
			dir = url;
			// Try default file name if passed directory
			if (!path.extname(url).length || fs.statSync(url).isDirectory()) {
				url = check(dir);
				if (!url) {
					throw new Error("" + (strong('buddy')) + " config not found in " + (strong(path.dirname(dir))));
				}
			}
			return url;
		} else {
			throw new Error("" + (strong('buddy')) + " config not found in " + (strong(path.dirname(dir))));
		}

	// No url specified
	// Find the first instance of a DEFAULT file based on the current working directory
	} else {
		while (true) {
			if (typeof dir !== "undefined" && dir !== null) {
				parent = path.resolve(dir, '../');
				// Exit if we can no longer go up a level
				if (parent === dir) {
					throw new Error("" + (strong('buddy')) + " config not found on this path");
				} else {
					// Walk
					dir = parent;
				}
			} else {
				// Start at current working directory
				dir = process.cwd();
			}
			url = check(dir);
			if (url) {
				return url;
			}
		}
	}
};

/**
 * Parse and validate config 'data'
 * @param {Object} data
 * @returns {Object}
 */
exports.parse = function (data) {
	var build = {};
	build.targets = [];

	var _parseTargets = function (type, sources, targets) {
		var valid = [];

		targets.forEach(function (target) {
			target.type = type;
			target.fileExtensions = FILE_EXTENSIONS[type];
			target.runtimeOptions = clone(exports.data.runtimeOptions);
			target.inputPath = path.resolve(target.input);
			target.outputPath = target.runtimeOptions.compress && target.output_compressed
				? path.resolve(target.output_compressed)
				: path.resolve(target.output);

			// Abort if input doesn't exist
			if (!fs.existsSync(target.inputPath)) {
				return warn("" + strong(target.input) + " doesn\'t exist");
			}

			target.isDir = fs.statSync(target.inputPath).isDirectory();
			var isOutputFile = path.extname(target.outputPath).length;
			// Abort if input is directory and output is file
			if (target.isDir && isOutputFile) {
				return warn("a file ("
					+ (strong(target.output))
					+ ") is not a valid output target for a directory ("
					+ (strong(target.input))
					+ ") input target");
			// Resolve default output file name for file>directory target
			} else if (!target.isDir && !isOutputFile) {
				target.outputPath = path.join(target.outputPath, path.basename(target.inputPath))
					.replace(path.extname(target.inputPath), "." + type);
			}

			// Parse sources
			target.sources = (sources
				? sources
				// Use input directory as default if none specified
				: target.isDir
					? [target.input]
					: [path.dirname(target.input)])
				.concat(DEFAULT_SOURCES[type])
				.map(function (source) {
					return path.resolve(source);
				});

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

			// Generate processing workflow
			processWorkflow(type, target);

			// Traverse child targets
			if (target.targets) {
				target.hasChildren = true;
				target.targets = _parseTargets(type, sources, target.targets);
			}
			// Store
			valid.push(target);
		});

		return valid;
	};

	// Loop through target types 'js/css/html'
	for (var type in data) {
		// Allow --targets to specify which targets to build
		if (!exports.data.runtimeOptions.targets || ~exports.data.runtimeOptions.targets.indexOf(type)) {
			var bld = data[type];

			// Validate
			if (bld && bld.targets && bld.targets.length) {
				// Store targets
				build.targets = build.targets.concat(_parseTargets(type, bld.sources, bld.targets));
			} else {
				warn('invalid build configuration: ' + strong(type));
			}
		}
	}

	// Return nothing if validation errors
	return build.targets.length ? build : null;
};

/**
 * Determine processing workflow (context:command)
 * @param {String} type
 * @param {Target} target
 */
function processWorkflow (type, target) {
	target.workflow = [['load']];
	if (type == 'html') {
		target.workflow[0].push('parse', 'compress')
		// Filter root files
		target.workflow.push(['compile', 'inline']);

	} else if (type == 'css') {
		if (target.runtimeOptions.lint) target.workflow[0].push('lint');
		target.workflow[0].push('parse');
		// Filter root files
		target.workflow.push(['inline', 'compile']);
		if (target.runtimeOptions.compress) target.workflow[1].push('compress');

	} else {
		if (target.runtimeOptions.lint) target.workflow[0].push('lint');
		target.workflow[0].push('compile');
		if (target.modular) {
			target.workflow[0].push('parse');
			target.workflow[0].push('inline', 'replace');
			if (target.runtimeOptions.lazy) {
				if (target.runtimeOptions.compress) target.workflow[0].push('compress');
				target.workflow[0].push('escape');
			}
			target.workflow[0].push('wrap');
			// Filter root files
			target.workflow.push(['concat']);
		}
		if (target.runtimeOptions.compress) target.workflow[1].push('compress');
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
	return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
}
