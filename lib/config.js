'use strict';

var alias = require('identify-resource').alias
	, clone = require('lodash/lang/clone')
	, cnsl = require('./utils/cnsl')
	, merge = require('lodash/object/merge')
	, flatten = require('lodash/array/flatten')
	, fs = require('fs')
	, glob = require('glob').sync
	, path = require('path')
	, recurFs = require('recur-fs')
	, unique = require('lodash/array/unique')

	, DEFAULT_FILE_EXTENSIONS = {
			js: ['js', 'json'],
			css: ['css'],
			html: ['html']
		}
	, DEFAULT_MANIFEST = {
			js: 'buddy.js',
			json: 'buddy.json',
			pkgjson: 'package.json'
		}
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
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080
		}
	, DEFAULT_SOURCES = ['.']
	, DEFAULT_CONFIG = {
			build: {},
			fileExtensions: merge({}, DEFAULT_FILE_EXTENSIONS),
			runtimeOptions: merge({}, DEFAULT_OPTIONS),
			server: merge({}, DEFAULT_SERVER),
			sources: DEFAULT_SOURCES.slice(),
			url: '',
			workflows: processWorkflows(DEFAULT_OPTIONS)
		}
	, RE_GLOB = /[\*\[\{]/
	, RE_UNIQUE = /{(?:hash|date)}/

	, debug = cnsl.debug
	, error = cnsl.error
	, hunt = recurFs.hunt.sync
	, indir = recurFs.indir
	, strong = cnsl.strong
	, warn = cnsl.warn;

/**
 * Load and parse configuration file
 * Accepts optional path to file or directory
 * @param {String | Object} [configpath]
 * @param {String} [fileExtensions]
 * @param {Object} [runtimeOptions]
 * @returns {Object}
 */
exports.load = function (configpath, fileExtensions, runtimeOptions) {
	var config = merge({}, DEFAULT_CONFIG, {
			fileExtensions: fileExtensions,
			runtimeOptions: runtimeOptions
		})
	, data, url;

	config.runtimeOptions.version = require(path.resolve(__dirname, '../package.json')).version;
	config.workflows = processWorkflows(config.runtimeOptions);

	// Load config path
	if ('string' == typeof configpath || configpath == null) {
		url = exports.locate(configpath);
		data = require(url);
		// Set current directory to location of file
		process.chdir(path.dirname(url));
		// Store
		config.url = url;

	// Passed in JSON object
	} else {
		data = configpath;
	}

	// Package.json
	if (data.buddy) data = data.buddy;

	// Copy server settings
	merge(config.server, data.server);

	if (data.build) {
		config.build = exports.parse([data.build], config);
		// Error parseing
		if (!config.build) throw new Error('invalid "build" data for ' + strong(url));
	} else {
		throw new Error('no "build" data for ' + strong(url));
	}

	return config;
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
		var urljs = path.join(dir, DEFAULT_MANIFEST.js)
			, urljson = path.join(dir, DEFAULT_MANIFEST.json)
			, urlpkgjson = path.join(dir, DEFAULT_MANIFEST.pkgjson)
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
					return (basename == DEFAULT_MANIFEST.js || basename == DEFAULT_MANIFEST.json || basename == DEFAULT_MANIFEST.pkgjson);
				}
			}, true);
		} catch (err) {
			if (!configpath) throw new Error(strong('buddy') + ' config not found');
		}
	}

	return configpath;
};

/**
 * Parse and validate build 'targets'
 * @param {Array} targets
 * @param {Object} config
 * @returns {Array}
 */
exports.parse = function (targets, config) {
	config = config || merge({}, DEFAULT_CONFIG);

	var parsed = [];

	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];

		if (target.modular == null) target.modular = true;
		target.fileExtensions = config.fileExtensions;
		target.runtimeOptions = clone(config.runtimeOptions);
		target.workflows = config.workflows;
		parseInput(target);
		target.output_compressed = target.output_compressed || '';
		parseOutput(target);
		if (validateInputOutput(target)) {
			parseSources(target, config);
			parseAppServer(target, config);
			// Store hooks
			if (target.before) target.before = defineHook(target.before);
			if (target.afterEach) target.afterEach = defineHook(target.afterEach);
			if (target.after) target.after = defineHook(target.after);
			// Register aliases
			if (target.alias) alias(target.alias);
			// Traverse child targets
			if (target.targets) {
				target.hasChildren = true;
				target.targets = exports.parse(target.targets, config);
			}
			parsed.push(target);

		// Split into multiple targets
		} else {
			for (var j = 0; j < target.input.length; j++) {
				var tgt = clone(target);
				tgt.input = target.input[j];
				tgt.output = target.output[j];
				tgt.inputPath = tgt.outputPath = '';
				targets.push(tgt);
			}
		}
	}

	return parsed;
};

/**
 * Process default workflows for 'runtimeOptions'
 * @param {Object} runtimeOptions
 * @returns {Object}
 */
function processWorkflows (runtimeOptions) {
	var workflows = {};

	// CSS
	workflows.css = [['load']];
	if (runtimeOptions.lint) workflows.css[0].push('lint');
	workflows.css[0].push('parse');
	workflows.css.push(['output:inline', 'output:compile']);
	if (runtimeOptions.compress) workflows.css[1].push('output:compress');

	// HTML
	workflows.html = [
		['load','parse', 'output:replaceReferences', 'output:compress'],
		['output:compile', 'output:inline']
	];

	// JS
	workflows.js = [['load']]
	if (runtimeOptions.lint) workflows.js[0].push('lint');
	// Allow for dead code removal by replacing env first
	workflows.js[0].push('output:replaceEnvironment', 'output:compile', 'parse');
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
 * Parse input path(s) for 'target'
 * @param {Object} target
 */
function parseInput (target) {
	if (target.input) {
		if (!Array.isArray(target.input)) target.input = [target.input];

		target.input = flatten(target.input.map(function (input) {
			// Expand glob pattern
			if (RE_GLOB.test(input)) {
				input = glob(input);
			}
			return input;
		}));

		target.inputPath = target.input.map(function (input) {
			var inputPath = path.resolve(input);
			if (!fs.existsSync(inputPath)) warn(strong(input) + ' doesn\'t exist');
			return inputPath;
		});

		if (target.input.length == 1) {
			target.input = target.input[0];
			target.inputPath = target.inputPath[0];
		}
	}
}

/**
 * Parse output path(s) for 'target'
 * @param {Object} target
 * @returns {Boolean}
 */
function parseOutput (target) {
	if (target.output) {
		if (!Array.isArray(target.output)) target.output = [target.output];
		if (!Array.isArray(target.output_compressed)) target.output_compressed = [target.output_compressed];

		target.outputPath = target.output.map(function (output, idx) {
			return (target.runtimeOptions.compress && target.output_compressed[idx])
				? path.resolve(target.output_compressed[idx])
				: path.resolve(output);
		});

		if (target.output.length == 1) {
			target.output = target.output[0];
			target.outputPath = target.outputPath[0];
		}
	}
}

/**
 * Validate input/output path(s) for 'target'
 * @param {Object} target
 * @returns {Boolean}
 */
function validateInputOutput (target) {
	if (target.input && target.output) {
		var isInputArray = Array.isArray(target.input)
			, isOutputArray = Array.isArray(target.output)
			, isInputFile = !isInputArray && path.extname(target.inputPath).length
			, isOutputFile = !isOutputArray && path.extname(target.outputPath).length;

		// Validate input/output combination
		if (isInputArray && isOutputArray) {
			if (target.input.length == target.output.length) {
				// Trigger split into multiple targets
				return false;
			} else {
				throw new Error('total number of inputs ('
					+ strong(target.input)
					+ ') do not match total number of outputs ('
					+ strong(target.output)
					+ ')');
			}
		} else if (!isInputArray && isOutputArray || !isInputFile && isOutputFile) {
			throw new Error('unable to resolve inputs ('
				+ strong(target.input)
				+ ') with outputs ('
				+ strong(target.output)
				+ ')');
		} else if (isInputArray && !isOutputArray) {
			// Multiple => single
			target.concat = isOutputFile;
			// Multiple => dir
			target.batch = !isOutputFile;
		} else if (!isInputFile && !isOutputFile) {
			target.batch = true;
		}
	}

	return true;
}

/**
 * Parse sources for 'target'
 * @param {Object} target
 * @param {Object} config
 */
function parseSources (target, config) {
	config.sources = (target.sources || [])
		.concat(config.sources)
		.map(function (source) {
			return path.resolve(source);
		});
	target.sources = config.sources;
}

/**
 * Determine if 'target' is app server
 * @param {Object} target
 * @param {Object} config
 */
function parseAppServer (target, config) {
	// Test if 'p' is in 'dirs'
	function contains (dirs, p) {
		if (!Array.isArray(dirs)) dirs = [dirs];
		return dirs.some(function (dir) {
			return indir(dir, p);
		});
	}

	if (config.server && config.server.file) {
		target.appServer = contains(target.inputPath, path.resolve(config.server.file));
	}
}

/**
 * Convert hook path or expression to Function
 * @param {String} hook
 * @returns {Function}
 */
function defineHook (hook) {
	// Load file content if filepath
	if ( path.extname(hook) && (~hook.indexOf('/') || ~hook.indexOf(path.sep))) {
		var hookpath;
		if (fs.existsSync(hookpath = path.resolve(hook))) {
			hook = fs.readFileSync(hookpath, 'utf8');
		} else {
			throw new Error('hook ('
				+ strong(hook)
				+ ') isn\'t a valid path');
		}
	}

	return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
}