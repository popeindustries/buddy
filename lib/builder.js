'use strict';

var chalk = require('chalk')
	, cnsl = require('./utils/cnsl')
	, compact = require('lodash/array/compact')
	, config = require('./config')
	, fileCache = require('./utils/fileCache')
	, fileFactory = require('./file')
	, flatten = require('lodash/array/flatten')
	, fs = require('fs')
	, path = require('path')
	, rm = require('recur-fs').rm
	, series = require('async').series
	, spawn = require('child_process').spawn
	, targetFactory = require('./target')
	, transfigure = require('transfigure')

	, JS = 'js'
	, CSS = 'css'
	, HTML = 'html'

	, bell = cnsl.BELL
	, debug = cnsl.debug
	, error = cnsl.error
	, print = cnsl.print
	, serverfarm = null
	, strong = cnsl.strong
	, warn = cnsl.warn
	, extensions;

module.exports = Builder;

/**
 * Constructor
 */
function Builder() {
	this.initialized = false;
	this.building = false;
	this.config = null;
	this.targets = [];
	this.fileCache = null;
}

/**
 * Build sources based on targets specified in config
 * @param {String|Object} configpath [file name | JSON Object]
 * @param {Object} options
 * @param {Function} fn(err)
 */
Builder.prototype.build = function (configpath, options, fn) {
	var self = this;

	cnsl.start('build');
	this.init(configpath, options);

	// Build targets
	this.buildTargets(this.targets, function (err, filepaths) {
		if (err) return fn ? fn(err) : error(err, 2);
		print('completed build in ' + chalk.cyan((cnsl.stop('build') / 1000) + 's'), 2);
		// Run script
		self.executeScript();
		if (fn) fn(null, filepaths);
	});
};

/**
 * Initialize based on configuration located at 'configpath'
 * The directory tree will be walked if no 'configpath' specified
 * @param {String|Object} configpath [file name | JSON Object]
 * @param {Object} options
 * @returns {Boolean}
 */
Builder.prototype.init = function (configpath, options) {
	options = options || {};

	// Set console behaviour
	cnsl.verbose = options.verbose;

	if (!this.initialized) {
		// Load compilers
		var fileExtensions = transfigure.load();

		// Load configuration file
		this.config = config.load(configpath, fileExtensions, options);

		print('loaded config ' + strong(this.config.url), 2);

		// Create cache
		this.fileCache = fileFactory.cache = fileCache(this.config.runtimeOptions.watch);

		// Setup watch
		if (this.config.runtimeOptions.watch) {
			this.fileCache.on('change', this.onFileCacheChange.bind(this));
			// TODO: add error listener
		}

		// Initialize targets
		this.targets = this.initTargets(this.config.build);

		return this.initialized = true;
	}
};

/**
 * Recursively initialize all valid target instances specified in configuration
 * @param {Array} targets
 * @returns {Array}
 */
Builder.prototype.initTargets = function (targets) {
	function init (targets, parent) {
		var instances = []
			, instance;

		targets.forEach(function (target) {
			instance = targetFactory(target);
			instances.push(instance);
			// Traverse
			if (instance.hasChildren) instance.targets = init(instance.targets, instance);
		});

		return instances;
	};

	return init(targets);
};

/**
 * Run all targets
 * @param {Array} targets
 * @param {Function} fn(err, filepaths)
 */
Builder.prototype.buildTargets = function (targets, fn) {
	var filepaths = []
		, self = this;

	this.building = true;

	// Execute targets in sequence
	series(targets.map(function (target) {
		return target.build.bind(target);
	}), function (err, results) {
		if (err) return fn(err);
		// Persist file references created on build
		filepaths = filepaths.concat(compact(flatten(results)));
		self.building = false;
		fn(null, filepaths);
	});
};

/**
 * Run the script defined in config 'script'
 */
Builder.prototype.executeScript = function () {
	var error = false
		, args, command, script;

	if (this.config.runtimeOptions.script && (script = this.config.script)) {
		script = script.split(' ');
		command = script.shift();
		args = script;

		print('executing script...', 2);
		debug('execute: ' + strong(this.config.script), 3);

		script = spawn(command, args, {cwd: process.cwd()});

		script.stdout.on('data', function (data) {
			process.stdout.write(data.toString());
		});

		script.stderr.on('data', function (data) {
			process.stderr.write(data.toString());
			error = true;
		});

		script.on('close', function (code) {
			if (error) process.stderr.write(bell);
		});
	}
};

/**
 * Cleanup after unhandled exception
 */
Builder.prototype.exceptionalCleanup = function () {
	if (serverfarm) serverfarm.stop();
};

/**
 * Reset
 */
Builder.prototype.destroy = function () {
	this.exceptionalCleanup();
	this.fileCache.flush();

	this.initialized = false;
	this.config = null;
	this.targets = [];
	this.fileCache = null;
};