'use strict';

var alias = require('identify-resource').alias
	, clone = require('lodash/lang/clone')
	, cnsl = require('./utils/cnsl')
	, extend = require('lodash/object/extend')
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
			port: 8080
		}
	, DEFAULT_SOURCES = {
			js: ['.'],
			css: ['.'],
			html: ['.']
		}
	, DEFAULT_CONFIG = {
			build: {},
			fileExtensions: extend({}, DEFAULT_FILE_EXTENSIONS),
			runtimeOptions: extend({}, DEFAULT_OPTIONS),
			server: extend({}, DEFAULT_SERVER),
			url: ''
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
	var config = extend({}, DEFAULT_CONFIG, {
			fileExtensions: fileExtensions,
			runtimeOptions: runtimeOptions
		})
	, data, url;

	config.runtimeOptions.version = require(path.resolve(__dirname, '../package.json')).version;

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
	extend(config.server, data.server);

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
 * Parse and validate build 'targets'
 * @param {Array} targets
 * @param {Object} config
 * @returns {Array}
 */
exports.parse = function (targets, config) {
	config = config || extend({}, DEFAULT_CONFIG);

	var parsed = [];

	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];

		if (target.modular == null) target.modular = true;
		target.fileExtensions = config.fileExtensions;
		target.runtimeOptions = clone(config.runtimeOptions);
		parseInput(target);
		target.output_compressed = target.output_compressed || '';
		parseOutput(target);
		if (validateInputOutput(target)) {
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
		} else if (isInputArray && !isOutputArray) {
			// Multiple => single
			target.concat = isOutputFile;
			// Multiple => dir
			target.batch = !isOutputFile;
		} else if (!isInputArray && isOutputArray || !isInputFile && isOutputFile) {
			throw new Error('unable to resolve inputs ('
				+ strong(target.input)
				+ ') with outputs ('
				+ strong(target.output)
				+ ')');
		}
	}

	return true;
}