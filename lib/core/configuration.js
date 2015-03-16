var alias = require('identify-resource').alias
	, clone = require('lodash/lang/clone')
	, cnsl = require('../utils/cnsl')
	, extend = require('lodash/object/extend')
	, fs = require('fs')
	, fsUtils = require('recur-fs')
	, glob = require('glob').sync
	, path = require('path')
	, unique = require('lodash/array/unique')

	, DEFAULT_JS = 'buddy.js'
	, DEFAULT_JSON = 'buddy.json'
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
	, DEFAULT_PACKAGE_JSON = 'package.json'
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080}
	, DEFAULT_SOURCES = {
			js: ['.'],
			css: ['.'],
			html: ['.']}
	, FILE_EXTENSIONS = {
			js: ['js', 'json', 'coffee', 'hbs', 'handlebars', 'dust', 'jade', 'nunjucks', 'nunjs', 'jsx', 'es6'],
			css: ['css', 'styl', 'less'],
			html: ['html', 'jade', 'twig', 'dust', 'handlebars', 'hbs', 'nunjucks', 'nunjs']}
	, RE_GLOB = /[\*\[\{]/
	, RE_UNIQUE = /{(?:hash|date)}/

	, debug = cnsl.debug
	, error = cnsl.error
	, indir = fsUtils.indir
	, strong = cnsl.strong
	, walk = fsUtils.walk.sync
	, warn = cnsl.warn;

exports.data = { runtimeOptions:{} };

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String | Object} [configpath]
 * @param {Object} [runtimeOptions]
 * @returns {Object}
 */
exports.load = function (configpath, runtimeOptions) {
	var url, data;

	runtimeOptions = runtimeOptions || {};
	runtimeOptions.version = require(path.resolve(__dirname, '../../package.json')).version;

	if ('string' == typeof configpath || configpath == null) {
		url = exports.locate(configpath);
		data = require(url);
		// Set current directory to location of file
		process.chdir(path.dirname(url));
		// Store
		exports.data.url = url;

	// Passed in JSON object
	} else {
		data = configpath;
	}

	// Package.json location
	if (data.buddy) data = data.buddy;
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
	exports.data.fileExtensions = FILE_EXTENSIONS;
	exports.data.server = extend({}, DEFAULT_SERVER, data.server);
	exports.data.script = data.script;

	// Validate
	if (data.build) {
		// Store
		if (data.build) {
			exports.data.build = exports.parse(data.build, exports.data.runtimeOptions, exports.data.cache);
			// Error parsing
			if (!exports.data.build) throw new Error('invalid "build" data for ' + strong(url));
		}
		return exports.data;
	} else {
		throw new Error('no "build" data for ' + strong(url));
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
					throw new Error(strong('buddy') + " config not found in " + strong(path.dirname(dir)));
				}
			}
			return url;
		} else {
			throw new Error(strong('buddy') + " config not found in " + strong(path.dirname(dir)));
		}

	// No url specified
	// Find the first instance of a DEFAULT file based on the current working directory
	} else {
		while (true) {
			if (typeof dir !== "undefined" && dir !== null) {
				parent = path.resolve(dir, '../');
				// Exit if we can no longer go up a level
				if (parent.toLowerCase() === dir.toLowerCase()) {
					throw new Error(strong('buddy') + " config not found on this path");
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
		var valid = []
			, target;

		for (var i = 0; i < targets.length; i++) {
			target = targets[i];
			target.type = type;
			if (target.modular == null) target.modular = true;
			target.fileExtensions = FILE_EXTENSIONS[type];
			target.runtimeOptions = clone(exports.data.runtimeOptions);
			parseInput(target);
			if (parseOutput(target)) {
				parseAppServer(target);
				parseSources(target, sources);
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
				processWorkflow(target);
				// Traverse child targets
				if (target.targets) {
					target.hasChildren = true;
					target.targets = _parseTargets(type, sources, target.targets);
				}
				// Store
				valid.push(target);
			} else {
				// Split target if multiple inputs/outputs
				target.runtimeOptions = target.fileExtensions = null;
				var inputs = target.input
					, outputs = target.output
					, t;

				for (var j = 0, m = inputs.length; j < m; j++) {
					t = clone(target);
					t.input = inputs[j];
					t.output = outputs[j];
					t.inputPath = null;
					targets.push(t);
				}
			}
		}

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
 * Parse input path(s) for 'target'
 * @param {Object} target
 */
function parseInput (target) {
	var existentialWarning = function (input) {
		warn("" + strong(input) + " doesn\'t exist");
	}

	// Match glob pattern
	if (RE_GLOB.test(target.input)) {
		target.input = glob(target.input);
	}

	// Handle array of input paths
	if (Array.isArray(target.input)) {
		target.inputPath = target.input.map(function (input) {
			var inputPath = path.resolve(input);
			if (!fs.existsSync(inputPath)) existentialWarning(input);
			return inputPath;
		});
		target.isBatch = true;

	// Handle single file
	} else {
		target.inputPath = path.resolve(target.input);
		if (!fs.existsSync(target.inputPath)) existentialWarning(target.input);
		// Directory
		target.isBatch = !path.extname(target.inputPath).length;
	}
}

/**
 * Parse output path(s) for 'target'
 * @param {Object} target
 * @returns {Boolean}
 */
function parseOutput (target) {
	// Output is optional...
	if (target.output) {
		// Handle array of output paths
		if (Array.isArray(target.output)) {
			if (target.output.length == 1) {
				// Remove array if only 1 element
				target.output = target.output[0];
			} else {
				// Abort if input is not also array or lengths don't match
				if (!Array.isArray(target.inputPath) || target.input.length != target.output.length) {
					return error("multiple files/directories outputs ("
						+ (strong(target.output))
						+ ") are not valid targets for ("
						+ (strong(target.input))
						+ ") input target");
				}
				// Trigger split into separate targets
				return false;
			}
		}

		// Handle specified compressed output path
		target.outputPath = (target.runtimeOptions.compress && target.output_compressed)
			? path.resolve(target.output_compressed)
			: path.resolve(target.output);
		// Outputting to file
		var isOutputFile = path.extname(target.outputPath).length;
		// Abort if input is directory and output is file
		if (target.isBatch && isOutputFile) {
			return error("a file ("
				+ (strong(target.output))
				+ ") is not a valid output target for ("
				+ (strong(target.input))
				+ ") input target");
		}

		// Resolve default output file name for file>directory target
		if (!target.isBatch && !isOutputFile) {
			target.outputPath = path.join(target.outputPath, path.basename(target.inputPath))
				.replace(path.extname(target.inputPath), "." + target.type);
		}
	}

	return true;
}

/**
 * Parse app server for 'target'
 * @param {Object} target
 */
function parseAppServer (target) {
	// Test if 'p' is in 'dirs'
	var contains = function (dirs, p) {
		if (!Array.isArray(dirs)) dirs = [dirs];
		return dirs.some(function (dir) {
			return indir(dir, p);
		});
	};

	if (exports.data.server && exports.data.server.file) {
		if (target.server != null) {
			target.isAppServer = target.server;
		} else {
			var server = path.resolve(exports.data.server.file);
			// Accept 'server' boolean setting
			target.isAppServer = target.isBatch
				? contains(target.inputPath, server)
				: (server == target.inputPath);
		}
	}
}

/**
 * Parse sources for 'target'
 * @param {Object} target
 * @param {Array} [sources]
 */
function parseSources (target, sources) {
	// Use input directory as default if none specified
	var derivedSources = function (inputs) {
		if (!Array.isArray(inputs)) inputs = [inputs];
		return inputs.map(function (input) {
			return path.extname(input).length
				? path.dirname(input)
				: input;
		});
	};

	target.sources = (sources ? sources : derivedSources(target.input))
		.concat(DEFAULT_SOURCES[target.type])
		.map(function (source) {
			return path.resolve(source);
		});
}

/**
 * Determine processing workflow
 * @param {Target} target
 */
function processWorkflow (target) {
	target.workflow = [['load']];
	if (target.type == 'html') {
		// If no output, watch task only
		if (target.outputPath) {
			target.workflow[0].push('parse', 'compress')
			target.workflow.push(['compile', 'inline']);
		}

	} else if (target.type == 'css') {
		if (target.runtimeOptions.lint) target.workflow[0].push('lint');
		// If no output, watch task only
		if (target.outputPath) {
			target.workflow[0].push('parse');
			target.workflow.push(['inline', 'compile']);
			if (target.runtimeOptions.compress) target.workflow[1].push('compress');
		}

	} else {
		if (target.runtimeOptions.lint) target.workflow[0].push('lint');
		// If no output, watch task only
		if (target.outputPath) {
			target.workflow[0].push('compile', 'replaceEnvironment', 'parse');
			if (target.modular) {
				target.workflow[0].push('inline', 'replaceReferences');
				if (target.runtimeOptions.lazy) {
					if (target.runtimeOptions.compress) target.workflow[0].push('compress');
					target.workflow[0].push('escape');
				}
				target.workflow[0].push('wrap');
				target.workflow.push(['concat']);
				if (target.runtimeOptions.compress) target.workflow[1].push('compress');
			}
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
	return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
}
