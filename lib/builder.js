var fs = require('fs')
	, path = require('path')
	, co = require('co')
	, thunkify = require('thunkify')
	, spawn = require('child_process').spawn
	, configuration = require('./core/configuration')
	, filelog = require('./utils/filelog')
	, targetFactory = require('./core/target')
	, fileFactory = require('./core/file')
	, FileCache = require('./utils/FileCache')
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
	this.building = false;
	this.config = null;
	this.targets = [];
	this.fileCache = null;
}

/**
 * Build sources based on targets specified in config
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @param {Function} fn(err, filepaths)
 */
Builder.prototype.build = function (configpath, options, fn) {
	co(function * (configpath, options) {
		try {
			cnsl.start('build');

			this._initialize(configpath, options);
			// Build targets.
			var filepaths = yield this._buildTargets(this.targets);
			print("completed build in " + colour((cnsl.stop('build') / 1000) + 's', cnsl.CYAN), 2);
			// Run script
			this._executeScript();

			return filepaths;
		} catch (err) {
			error(err, 2);
		}
	}).call(this, configpath, options, fn);
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
		if (self.config.runtimeOptions.reload || self.config.runtimeOptions.serve) {
			// Protect against uninstalled add-on
			try {
				serverfarm = require('./utils/serverfarm');
				// Start servers
				serverfarm.start(self.config.runtimeOptions.serve, self.config.runtimeOptions.reload, self.config.server, function (err) {
					// Swallow all server errors
					if (err) return;
					print('watching files for changes:', 2);
				});
			} catch (err) {
				error('buddy-server add-on missing. Install \'buddy-server\' with npm', 3, false);
			}
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
Builder.prototype._initialize = function (configpath, options) {
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
			this.fileCache.on('change', this._onFileCacheChange.bind(this));
			// TODO: add error listener
		}

		// Initialize targets
		this.targets = this._initializeTargets(this.config.build.targets);

		return this.initialized = true;
	}
};

/**
 * Recursively initialize all valid target instances specified in configuration
 * @param {Array} targets
 * @returns {Array}
 */
Builder.prototype._initializeTargets = function (targets) {
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
 * Run all targets for a given 'type'
 * @param {Array} targets
 * @returns {Array}
 */
Builder.prototype._buildTargets = function * (targets) {
	var paths = []
		, filepaths;

	// Execute targets in sequence
	this.building = true;
	for (var i = 0, n = targets.length; i < n; i++) {
		filepaths = yield targets[i].build();
		// Persist file references created on build
		if (filepaths) {
			filelog.add(filepaths);
			paths = paths.concat(filepaths);
		}
	}

	this.building = false;
	return paths;
};

/**
 * Run the script defined in config 'script'
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
 * @param {File} file
 */
Builder.prototype._onFileCacheChange = function (file) {
	var self = this
		, now = new Date()
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

		co(function * () {
			try {
				var files = yield this._buildTargets(targets);
				if (serverfarm) {
					var file = files.length ? files[0] : 'foo.js';
					// Restart app server
					if (servers.length) yield thunkify(serverfarm.restart)();
					// Refresh browser
					serverfarm.refresh(path.basename(file));
				}
				print('completed build in ' + (colour((cnsl.stop('watch')) / 1000 + 's', cnsl.CYAN)), 2);
				// Run test script
				this._executeScript();
			} catch (err) {
				// Don't throw
				if (err) error(err, 2, false);
			}
		}).call(this);
	}
};
