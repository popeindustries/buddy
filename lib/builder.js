var cnsl = require('./utils/cnsl')
	, bell = cnsl.BELL
	, colour = cnsl.colour
	, debug = cnsl.debug
	, error = cnsl.error
	, print = cnsl.print
	, strong = cnsl.strong
	, warn = cnsl.warn
	, configuration = require('./core/configuration')
	, dependencies = null
	, FileCache = require('./utils/FileCache')
	, fileFactory = require('./core/file')
	, filelog = require('./utils/filelog')
	, fs = require('fs')
	, lodash = require('lodash')
	, compact = lodash.compact
	, flatten = lodash.flatten
	, path = require('path')
	, rm = require('recur-fs').rm
	, series = require('async').series
	, serverfarm = null
	, spawn = require('child_process').spawn
	, targetFactory = require('./core/target')

	, JS = 'js'
	, CSS = 'css'
	, HTML = 'html';

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
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @param {Function} fn(err)
 */
Builder.prototype.build = function (configpath, options, fn) {
	var self = this;

	cnsl.start('build');
	this.initialize(configpath, options);

	// Build targets
	this.buildTargets(this.targets, function (err, filepaths) {
		if (err) return fn ? fn(err) : error(err, 2);
		print("completed build in " + colour((cnsl.stop('build') / 1000) + 's', cnsl.CYAN), 2);
		// Run script
		self.executeScript();
		if (fn) fn(null, filepaths);
	});
};

/**
 * Build sources and watch for changes
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @returns {Promise}
 */
Builder.prototype.watch = function (configpath, options) {
	var self = this;

	// Build first
	this.build(configpath, options, function (err, filepaths) {
		if (err) return error(err, 2);

		if (self.config.runtimeOptions.reload || self.config.runtimeOptions.serve) {
			// Protect against uninstalled add-on
			try {
				serverfarm = require('./utils/serverfarm');
			} catch (err) {
				return error('buddy-server add-on missing. Install \'buddy-server\' with npm', 3, false);
			}
			// Start servers
			serverfarm.start(self.config.runtimeOptions.serve, self.config.runtimeOptions.reload, self.config.server, function (err) {
				if (err && !~err.message.indexOf('ECONNRESET')) {
					error('problem starting servers', 3, false);
				}
			});
		} else {
			print('watching files for changes:', 2);
		}
	});
};

/**
 * Build and compress sources based on targets specified in configuration
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @returns {Promise}
 */
Builder.prototype.deploy = function (configpath, options) {
	options.compress = true;
	return this.build(configpath, options);
};

/**
 * List all file system content created via installing and building
 * @param {Object} options
 */
Builder.prototype.list = function (options) {
	cnsl.verbose = options.verbose;
	filelog.load();
	// List files
	print('listing generated files...', 2);
	filelog.files.forEach(function (file) {
		print(strong(file), 3);
	});
};

/**
 * Remove all file system content created via installing and building
 * @param {Object} options
 */
Builder.prototype.clean = function (options) {
	cnsl.verbose = options.verbose;
	filelog.load();
	// Delete files
	print('cleaning generated files...', 2);
	filelog.files.forEach(function (file) {
		print(colour('deleted', cnsl.RED) + " " + (strong(file)), 3);
		rm(path.resolve(file), function () {});
	});
	filelog.clean();
};

/**
 * Cleanup after unhandled exception
 */
Builder.prototype.exceptionalCleanup = function () {
	if (dependencies) dependencies.clean();
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

/**
 * Initialize based on configuration located at 'configpath'
 * The directory tree will be walked if no 'configpath' specified
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @returns {Boolean}
 */
Builder.prototype.initialize = function (configpath, options) {
	options = options || {};

	// Set console behaviour
	cnsl.verbose = options.verbose;

	if (!this.initialized) {
		// Load configuration file
		this.config = configuration.load(configpath, options);

		print("loaded config " + (strong(this.config.url)), 2);

		// Load filelog
		filelog.load();

		// Create cache
		this.fileCache = fileFactory.cache = new FileCache(this.config.runtimeOptions.watch);

		// Setup watch
		if (this.config.runtimeOptions.watch) {
			this.fileCache.on('change', this.onFileCacheChange.bind(this));
			// TODO: add error listener
		}

		// Initialize targets
		this.targets = this.initializeTargets(this.config.build.targets);

		return this.initialized = true;
	}
};

/**
 * Recursively initialize all valid target instances specified in configuration
 * @param {Array} targets
 * @returns {Array}
 */
Builder.prototype.initializeTargets = function (targets) {
	function _init (targets, parent) {
		var instances = []
			, instance;

		targets.forEach(function (target) {
			instance = targetFactory(target);
			instances.push(instance);
			// Traverse
			if (instance.hasChildren) instance.targets = _init(instance.targets, instance);
		});

		return instances;
	};

	return _init(targets);
};

/**
 * Run all targets for a given 'type'
 * @param {Array} targets
 * @param {Function} fn(err, filepaths)
 */
Builder.prototype.buildTargets = function (targets, fn) {
	var filepaths = []
		, self = this;

	// Execute targets in sequence
	this.building = true;

	series(targets.map(function (target) {
		return target.build.bind(target);
	}), function (err, results) {
		if (err) return fn(err);
		// Persist file references created on build
		filepaths = filepaths.concat(compact(flatten(results)));
		filelog.add(filepaths);
		self.building = false;
		fn(null, filepaths);
	});
};

/**
 * Run the script defined in config 'script'
 */
Builder.prototype.executeScript = function () {
	var error = false
		, script, command, args;

	if (this.config.runtimeOptions.script && (script = this.config.script)) {
		script = script.split(' ');
		command = script.shift();
		args = script;

		print('executing script...', 2);
		debug("execute: " + (strong(this.config.script)), 3);

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
 * Handle cache changes
 * @param {File} file
 */
Builder.prototype.onFileCacheChange = function (file) {
	var now = new Date()
		, self = this
		, targets = this.targets.filter(function (target) {
				return target.hasFile(file);
			})
			// Determine if any changes to app server code that needs a restart
		, servers = targets.filter(function (target) {
				return target.isAppServer;
			});

	if (!this.building) {
		print('['
			+ now.toLocaleTimeString()
			+ '] '
			+ colour('changed', cnsl.YELLOW)
			+ ' '
			+ strong(path.relative(process.cwd(), file.filepath)), 2);

		cnsl.start('watch');

		this.buildTargets(targets, function (err, filepaths) {
			// Don't throw
			if (err) {
				error(err, 2, false);
			} else {
				if (serverfarm) {
					var filepath = filepaths.length ? filepaths[0] : 'foo.js';
					// Restart app server
					if (servers.length) {
						serverfarm.restart(function (err) {
							// Refresh browser
							serverfarm.refresh(path.basename(filepath));
						});
					} else {
						// Refresh browser
						serverfarm.refresh(path.basename(filepath));
					}
				}
				print('completed build in ' + (colour((cnsl.stop('watch')) / 1000 + 's', cnsl.CYAN)), 2);
				// Run test script
				self.executeScript();
			}
		});
	}
};
