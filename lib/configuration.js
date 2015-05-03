'use strict';

var alias = require('identify-resource').alias
	, clone = require('lodash/lang/clone')
	, cnsl = require('./utils/cnsl')
	, extend = require('lodash/object/extend')
	, fs = require('fs')
	, fsUtils = require('recur-fs')
	, glob = require('glob').sync
	, path = require('path')
	, unique = require('lodash/array/unique')

	, DEFAULT_FILE_EXTENSIONS = {
			js: ['js', 'json'],
			css: ['css'],
			html: ['html']}
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
			verbose: false
		}
	, DEFAULT_PACKAGE_JSON = 'package.json'
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080}
	, DEFAULT_SOURCES = ['.']
	, RE_GLOB = /[\*\[\{]/

	, fileExtensions = extend({}, DEFAULT_FILE_EXTENSIONS)
	, hunt = fsUtils.hunt.sync
	, indir = fsUtils.indir
	, runtimeOptions = extend({}, DEFAULT_OPTIONS)
	, serverOptions = extend({}, DEFAULT_SERVER)
	, sources = []
	, strong = cnsl.strong
	, warn = cnsl.warn
	, workflows = {};

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String | Object} [configpath]
 * @param {String} [extensions]
 * @param {Object} [options]
 * @returns {Object}
 */
exports.load = function (configpath, extensions, options) {
	var url, data;

	options = options || {};
	options.version = require(path.resolve(__dirname, '../package.json')).version;

	// Load from path
	if ('string' == typeof configpath || configpath == null) {
		url = exports.locate(configpath);
		data = require(url);
		// Set current directory to location of file
		process.chdir(path.dirname(url));

	// Passed in JSON object
	} else {
		data = configpath;
	}

	// Package.json
	if (data.buddy) data = data.buddy;

	extend(fileExtensions, extensions);
	extend(runtimeOptions, options);
	extend(serverOptions, data.server);

	// Validate
	if (data.build) {
		data.build = exports.parse(data.build);
		// Error parsing
		if (!data.build) throw new Error('invalid "build" data for ' + strong(url));
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
	var configpath;

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

	if (url) {
		configpath = path.resolve(url);
			try {
				// Try default file name if passed directory
				if (!path.extname(configpath).length || fs.statSync(configpath).isDirectory()) {
					configpath = check(configpath);
					if (!configpath) throw 'no default found';
				}
			} catch (err) {
				throw new Error(strong('buddy') + ' config not found in ' + strong(path.dirname(url)));
			}

	// No url specified
	} else {
		try {
			// Find the first instance of a DEFAULT file based on the current working directory
			configpath = hunt(process.cwd(), function (resource, stat) {
				if (stat.isFile()) {
					var basename = path.basename(resource);
					return (basename == DEFAULT_PACKAGE_JSON || basename == DEFAULT_JS || basename == DEFAULT_JSON);
				}
			}, true);
		} catch (err) {
			if (!configpath) throw new Error(strong('buddy') + ' config not found');
		}
	}

	return configpath;
};

/**
 * Parse and validate config 'data'
 * @param {Object} data
 * @returns {Object}
 */
exports.parse = function (data) {
	workflows = processWorkflows(runtimeOptions);
	sources = unique((data.sources || []).concat(DEFAULT_SOURCES)
		.map(function (source) {
			return path.resolve(source);
		}));

	var build = {
		sources: sources,
		targets: []
	};

	if (Array.isArray(data.targets) && data.targets.length) {
		// TODO: enable filtering (--target flag)
		build.targets = parseTargets(data.targets);
	}

	// Return nothing if validation errors
	return build.targets.length ? build : null;
};

/**
 * Parse 'targets'
 * @param {Array} targets
 * @returns {Array}
 */
function parseTargets (targets) {
	var valid = []
		, target;

	for (var i = 0; i < targets.length; i++) {
		target = targets[i];
		if (target.modular == null) target.modular = true;
		target.fileExtensions = fileExtensions;
		target.runtimeOptions = clone(runtimeOptions);
		target.workflows = workflows;
		parseInput(target);
		parseType(target);
		// Single target
		if (parseOutput(target)) {
			parseAppServer(target);
			parseSources(target);
			// Store hooks
			if (target.before) target.before = defineHook(target.before);
			if (target.afterEach) target.afterEach = defineHook(target.afterEach);
			if (target.after) target.after = defineHook(target.after);
			// Register aliases
			if (target.alias) alias(target.alias);
			// Override bootstrap/boilerplate
			if (!target.modular) {
				target.bootstrap = target.boilerplate = false;
			}
			// Traverse child targets
			if (target.targets) {
				target.hasChildren = true;
				target.targets = parseTargets(target.targets);
			}
			// Store
			valid.push(target);

		// Multiple targets
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
}

/**
 * Parse input path(s) for 'target'
 * @param {Object} target
 */
function parseInput (target) {
	function existentialWarning (input) {
		warn(strong(input) + ' doesn\'t exist');
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
 * Parse type for 'target'
 * @param {Object} target
 */
function parseType (target) {
	var ext = path.extname(Array.isArray(target.inputPath)
		? target.inputPath[0]
		: target.inputPath
	).slice(1);

	// Match input extension to type
	for (var type in fileExtensions) {
		if (!target.type) {
			var exts = fileExtensions[type];
			for (var i = 0, n = exts.length; i < n; i++) {
				if (ext == exts[i]) {
					target.type = type;
					break;
				}
			}
		}
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
					throw new Error('multiple files/directories outputs ('
						+ (strong(target.output))
						+ ') are not valid targets for ('
						+ (strong(target.input))
						+ ') input target');
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
			throw new Error('a file ('
				+ (strong(target.output))
				+ ') is not a valid output target for ('
				+ (strong(target.input))
				+ ') input target');
		}

		// Resolve default output file name for file>directory target
		if (!target.isBatch && !isOutputFile) {
			target.outputPath = path.join(target.outputPath, path.basename(target.inputPath))
				.replace(path.extname(target.inputPath), '.' + target.type);
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
	function contains (dirs, p) {
		if (!Array.isArray(dirs)) dirs = [dirs];
		return dirs.some(function (dir) {
			return indir(dir, p);
		});
	}

	if (serverOptions && serverOptions.file) {
		// Accept 'server' boolean setting
		if (target.server != null) {
			target.isAppServer = target.server;
		} else {
			var server = path.resolve(serverOptions.file);
			target.isAppServer = target.isBatch
				? contains(target.inputPath, server)
				: (server == target.inputPath);
		}
	}
}

/**
 * Parse sources for 'target'
 * @param {Object} target
 */
function parseSources (target) {
	// Use input directory as default if none specified
	function derivedSources (inputs) {
		if (!Array.isArray(inputs)) inputs = [inputs];
		return inputs.map(function (input) {
			return path.resolve(path.extname(input).length
				? path.dirname(input)
				: input);
		});
	}

	// Derive additional sources based on input
	target.sources = unique(derivedSources(target.input).concat(sources));
}

/**
 * Process default workflows for 'runtimeOptions'
 * @param {Object} data
 * @param {Object} runtimeOptions
 * @returns {Object}
 */
function processWorkflows (runtimeOptions) {
	var workflows = {};

	// CSS
	workflows.css = [['load']];
	if (runtimeOptions.lint) workflows.css[0].push('lint');
	workflows.css[0].push('output:parse');
	workflows.css.push(['output:inline', 'output:compile']);
	if (runtimeOptions.compress) workflows.css[1].push('output:compress');

	// HTML
	workflows.html = [['load']];
	workflows.html[0].push('output:parse', 'output:replaceReferences', 'output:compress')
	workflows.html.push(['output:compile', 'output:inline']);

	// JS
	workflows.js = [['load']]
	if (runtimeOptions.lint) workflows.js[0].push('lint');
	// Allow for dead code removal by replacing env first
	workflows.js[0].push('output:replaceEnvironment', 'output:compile', 'output:parse');
	workflows.js[0].push('modular:output:inline', 'modular:output:replaceReferences');
	if (runtimeOptions.lazy) {
		if (runtimeOptions.compress) workflows.js[0].push('modular:output:compress');
		workflows.js[0].push('modular:output:escape');
	}
	workflows.js[0].push('modular:output:wrap');
	workflows.js.push(['modular:output:concat']);
	if (runtimeOptions.compress) workflows.js[1].push('modular:output:compress');

	return workflows;
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
