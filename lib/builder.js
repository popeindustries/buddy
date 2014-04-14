var fs = require('fs')
	, path = require('path')
	, Promise = require('bluebird')
	, spawn = require('child_process').spawn
	, configuration = require('./core/configuration')
	, filelog = require('./utils/filelog')
	, targetFactory = require('./core/target')
	, fileFactory = require('./core/file')
	, FileCache = require('./core/FileCache')
	, dependencies = null
	, serverfarm = null
	, rm = require('recur-fs').rm
	, cnsl = require('./utils/cnsl')
	, debug = cnsl.debug
	, warn = cnsl.warn
	, error = cnsl.error
	, print = cnsl.print
	, colour = cnsl.colour
	, strong = cnsl.strong
	, bell = cnsl.BELL

	, JS = 'js'
	, CSS = 'css'
	, HTML = 'html';

module.exports = Builder;

/**
 * Constructor
 */
function Builder() {
	this.initialized = false;
	this.config = null;
	this.targets = [];
	this.fileCache = null;
}

/**
 * Build sources based on targets specified in config
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @returns {Promise}
 */
Builder.prototype.build = function (configpath, options) {
	var self = this
		, script;

	cnsl.start('build');

	return this._initialize(configpath, options)
		.then(function () {
			// Build targets.
			return self._buildTargets(self.targets)
		}).then(function (filepaths) {
				print("completed build in " + colour((cnsl.stop('build') / 1000) + 's', cnsl.CYAN), 2);
				// Run script
				self._executeScript();
				return filepaths;
		}).catch(function (err) {
			return error(err, 2);
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
	return this.build(configpath, options)
		.then(function () {
			if (self.config.runtimeOptions.reload || self.config.runtimeOptions.serve) {
				// Protect against uninstalled add-on
				try {
					serverfarm = require('./utils/serverfarm');
					// Start servers
					serverfarm.start(self.config.runtimeOptions.serve, self.config.runtimeOptions.reload, self.config.server, function (err) {
						// Swallow all server errors
					});
				} catch (err) {
					error('buddy-server add-on missing. Install \'buddy-server\' with npm', 3, false);
				}
			}
			print('watching files for changes:', 2);
		}).catch(function (err) {
			return error(err, 2);
		})
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
 * @returns {Promise(success)}
 */
Builder.prototype._initialize = function (configpath, options) {
	options = options || {};

	// Set console behaviour
	cnsl.verbose = options.verbose;

	if (!this.initialized) {
		// Load configuration file
		this.config = configuration.load(configpath, options);

		print("loaded config " + (strong(data.url)), 2);

		// Load filelog
		filelog.load();

		// Create cache
		this.fileCache = fileFactory.cache = new FileCache(data.runtimeOptions.watch);

		// Setup watch
		if (data.runtimeOptions.watch) {
			this.fileCache.on('change', this._onFileCacheChange.bind(this));
			// TODO: add error listener
		}

		// Initialize targets
		this.targets = this._initializeTargets(data.build.targets);

		return this.initialized = true;
	}
};

/**
 * Recursively initialize all valid target instances specified in configuration
 * @param {Array} targets
 * @returns {Array}
 */
Builder.prototype._initializeTargets = function (targets) {
	var instances = []
		, init = function (targets, parent) {
				var instance;
				targets.forEach(function (target) {
					instance = targetFactory(target);
					instance.parent = parent;
					instance.hasParent = !!parent;
					instances.push(instance);
					// Traverse
					if (instance.hasChildren) init(instance.targets, instance);
				});
			};

	init(targets);

	return instances;
};

/**
 * Run all targets for a given 'type'
 * @param {Array} targets
 * @returns {Promise(filepaths)}
 */
Builder.prototype._buildTargets = function (targets) {
	var paths = [];

	// Execute targets in sequence
	return Promise.reduce(targets, function (narg, target) {
		return target.build()
			.then(function (filepaths) {
				// Persist file references created on build
				if (filepaths) {
					filelog.add(filepaths);
					paths = paths.concat(filepaths);
				}
				// Reload
				if (serverfarm) serverfarm.refresh(path.basename(filepaths[0]));
				return paths;
			});
	}, null);
};

/**
 * Run the script defined in config 'test'
 */
Builder.prototype._executeScript = function () {
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
 * @param {Error} err
 * @param {File} file
 */
Builder.prototype._onFileCacheChange = function (file) {
	var self = this
		, now = new Date();

	print('['
		+ now.toLocaleTimeString()
		+ '] '
		+ colour('changed', cnsl.YELLOW)
		+ ' '
		+ strong(path.relative(process.cwd(), file.filepath)), 2);

	cnsl.start('watch');

	lastFileChange = now;

	this._buildTargets(file.type, function (err) {
		// Don't throw
		if (err) return error(err, 2, false);
		print('completed build in ' + (colour((cnsl.stop('watch')) / 1000 + 's', cnsl.CYAN)), 2);
		// Run test script
		self._executeScript();
	});
};
