var fs = require('fs')
	, path = require('path')
	, exec = require('child_process').exec
	, async = require('async')
	, configuration = require('./core/configuration')
	, filelog = require('./utils/filelog')
	, targetFactory = require('./core/target')
	, FileCache = require('./core/filecache')
	, dependencies = null
	, serverfarm = require('./utils/serverfarm')
	, rm = require('recur-fs').rm
	, term = require('buddy-term')
	, debug = term.debug
	, warn = term.warn
	, error = term.error
	, print = term.print
	, colour = term.colour
	, strong = term.strong;

var JS = 'js'
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
 * Install dependencies as specified in config file found at 'configpath'
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 */
Builder.prototype.install = function(configpath, options) {
	var self = this
		, lib;
	term.start('install');
	this._initialize(configpath, options, function(err) {
		if (err) return error(err, 2);
		if (self.config.dependencies) {
			lib = path.resolve(__dirname, '../../', 'buddy-dependencies');
			if (fs.existsSync(lib)) {
				dependencies = require(lib);
				print('installing dependencies...', 2);
				dependencies.install(self.config.dependencies, term, function(err, files) {
					// Persist file references created on install
					if (files) filelog.add(files);
					if (err) return error(err, 2);
					print("completed install in " + colour((term.stop('install') / 1000) + 's', term.CYAN), 2);
				});
			} else {
				error('buddy-dependencies add-on missing. Add ' + strong('buddy-dependencies') + ' to your project\'s package.json', 2);
			}
		} else {
			error('no dependencies specified in configuration file', 2);
		}
	});
};

/**
 * Build sources based on targets specified in config
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @param {Function} fn(err)
 */
Builder.prototype.build = function(configpath, options, fn) {
	var self = this
		, script;
	term.start('build');
	this._initialize(configpath, options, function(err) {
		if (err) return error(err, 2);
		// Initialize targets
		self._initializeTargets(self.config.build.targets);
		// Build targets.
		self._buildTargets(function(err) {
			print("completed build in " + colour((term.stop('build') / 1000) + 's', term.CYAN), 2);
			if (fn) fn(err);
			if (err) return error(err, 2);
			// Run test script
			self._executeScript();
		});
	});
};

/**
 * Build sources and watch for changes
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 */
Builder.prototype.watch = function(configpath, options) {
	var self = this
		, settings, script;
	// Build first
	this.build(configpath, options, function(err) {
		if (err) return error(err, 2);
		// Start servers
		if (self.config.runtimeOptions.reload || self.config.runtimeOptions.serve) {
			serverfarm.start(self.config.runtimeOptions.serve, self.config.runtimeOptions.reload, self.config.settings.server, function(err) {
				// Server error, don't throw
				if (err) error(err, 2, false);
				print('watching files for changes:', 2);
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
 */
Builder.prototype.deploy = function(configpath, options) {
	options.compress = true;
	this.build(configpath, options);
};

/**
 * List all file system content created via installing and building
 * @param {Object} options
 */
Builder.prototype.list = function(options) {
	term.verbose = options.verbose;
	filelog.load();
	// List files
	print('listing generated files...', 2);
	filelog.files.forEach(function(file) {
		print(strong(file), 3);
	});
};

/**
 * Remove all file system content created via installing and building
 * @param {Object} options
 */
Builder.prototype.clean = function(options) {
	term.verbose = options.verbose;
	filelog.load();
	// Delete files
	print('cleaning generated files...', 2);
	filelog.files.forEach(function(file) {
		print(colour('deleted', term.RED) + " " + (strong(file)), 3);
		rm(path.resolve(file), function() {});
	});
	filelog.clean();
};

/**
 * Cleanup after unhandled exception
 */
Builder.prototype.exceptionalCleanup = function() {
	if (dependencies) dependencies.clean();
	if (serverfarm) serverfarm.stop();
};

/**
 * Initialize based on configuration located at 'configpath'
 * The directory tree will be walked if no 'configpath' specified
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @param {Function} fn()
 */
Builder.prototype._initialize = function(configpath, options, fn) {
	var self = this;
	term.verbose = options.verbose;
	if (!this.initialized) {
		// Load configuration file
		configuration.load(configpath, options, function(err, data) {
			if (err) return fn(err);
			self.config = data;
			print("loaded config " + (strong(data.url)), 2);
			// Load filelog
			filelog.load();
			// Create cache
			self.fileCache = new FileCache(data.runtimeOptions.watch);
			// Setup watch
			if (data.runtimeOptions.watch) {
				self.fileCache.on('change', self._onFileCacheChange.bind(self));
			}
			fn();
		});
	} else {
		fn();
	}
};

/**
 * Recursively cache all valid target instances specified in configuration
 * @param {Array} targets
 */
Builder.prototype._initializeTargets = function(targets) {
	var self = this;
	var init = function(targets, parent) {
		var instance;
		targets.forEach(function(target) {
			instance = targetFactory(self.fileCache, target);
			instance.parent = parent;
			instance.hasParent = !!parent;
			self.targets.push(instance);
			// Traverse
			if (instance.hasChildren) init(instance.targets, instance);
		});
	};

	init(targets);
};

/**
 * Run all targets for a given 'type'
 * @param {String} type
 * @param {Function} fn(err)
 */
Builder.prototype._buildTargets = function(type, fn) {
	if (!fn && 'function' == typeof type) {
		fn = type;
		type = '*';
	}
	async.eachSeries(this.targets, (function(target, cb) {
		if (target.type == type || type == '*') {
			target.build(function(err, files) {
				// Persist file references created on build
				if (files) filelog.add(files);
				// Reset unless target has children
				if (!target.hasChildren) target.reset();
				// Return error
				if (err) return cb(err);
				// Reload
				serverfarm.refresh(path.basename(files[0]));
				cb();
			});
		} else {
			cb();
		}
	}), fn);
};

/**
 * Run the script defined in config 'test'
 */
Builder.prototype._executeScript = function() {
	var script;
	if (this.config.runtimeOptions.test && (script = this.config.settings.test)) {
		print('executing test script...', 2);
		debug("execute: " + (strong(this.config.settings.test)), 3);
		exec(script, function(err, stdout, stderr) {
			if (err) return error(err);
			if (stdout) console.log(stdout);
			if (stderr) console.log(stderr);
		});
	}
};

/**
 * Handle cache changes
 * @param {Error} err
 * @param {File} file
 */
Builder.prototype._onFileCacheChange = function(file) {
	var self = this;
	print("["
		+ new Date().toLocaleTimeString()
		+ "] "
		+ colour('changed', term.YELLOW)
		+ " "
		+ strong(path.relative(process.cwd(), file.filepath)), 2);
	term.start('watch');
	this._buildTargets(file.type, function(err) {
		// Don't throw
		if (err) return error(err, 2, false);
		print("completed build in " + (colour((term.stop('watch')) / 1000 + 's', term.CYAN)), 2);
		// Run test script
		self._executeScript();
	});
};
