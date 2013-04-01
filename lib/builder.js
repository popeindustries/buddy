var fs = require('fs')
	, path = require('path')
	, exec = require('child_process').exec
	, async = require('async')
	, configuration = require('./core/configuration')
	, filelog = require('./utils/filelog')
	, targetFactory = require('./core/target')
	, Cache = require('./utils/cache')
	, dependencies = require('buddy-dependencies')
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
	this.cache = new Cache();
}

/**
 * Build sources based on targets specified in config
 * @param {String} configpath [file name or directory containing default]
 * @param {Object} options
 * @param {Function} fn(err)
 */
Builder.prototype.build = function(configpath, options, fn) {
	var self = this
		, script;
	this._initialize(configpath, options, function(err) {
		if (err) return error(err, 2);
		// Initialize targets
		self._initializeTargets(self.config.build.targets);
		// Build targets.
		self._buildTargets(function(err) {
			if (fn) fn(err);
			if (err) return error(err, 2);
			// print("completed build in " + (colour((+new Date() - start) / 1000 + 's', term.CYAN)), 2);
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
		if (self.config.options.reload || self.config.options.serve) {
			settings = self.config.settings.server || {directory: null, port: null};
			serverfarm.start(self.config.serve, self.config.reload, settings, function(err) {
				// Server error, don't throw
				if (err) error(err, 2, false);
			});
		}
		// Start watching
		self.targets.forEach(function(target) {
			target.on('update', function() {
				self._buildTargets(target.type, function(err) {
					// Build error, don't throw
					if (err) return error(err, 2, false);
					// Run test script
					self._executeScript();
				});
			});
		});
	});
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
	// term.start();
	if (!this.initialized) {
		// Load configuration file
		configuration.load(configpath, options, function(err, data) {
			if (err) return fn(err);
			self.config = data;
			// print("loaded config " + (strong(data.url)), 2);
			// Load filelog
			filelog.load();
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
			instance = targetFactory(self.cache, target);
			instance.parent = parent;
			instance.hasParent = !!parent;
			// Traverse
			if (instance.hasChildren) init(instance.targets, instance);
			self.targets.push(instance);
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
				// serverfarm.refresh(path.basename(files[0]));
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
		// print('executing test script...', 2);
		// debug("execute: " + (strong(this.config.settings.test)), 3);
		exec(script, function(err, stdout, stderr) {
			if (err) return fn(err);
			if (stdout) console.log(stdout);
			if (stderr) console.log(stderr);
			fn();
		});
	}
};
