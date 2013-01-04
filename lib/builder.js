var fs = require('fs')
	, path = require('path')
	, exec = require('child_process').exec
	, async = require('async')
	, targetFactory = require('./core/target')
	, configuration = require('./core/configuration')
	, processors = require('./processors')
	, dependencies = require('./core/dependencies')
	, Source = require('./core/source')
	, filelog = require('./utils/filelog')
	, object = require('./utils/object')
	, bind = object.bind
	, notify = require('./utils/notify')
	, debug = notify.debug
	, warn = notify.warn
	, error = notify.error
	, print = notify.print
	, colour = notify.colour
	, strong = notify.strong
	, _fs = require('./utils/fs')
	, readdir = _fs.readdir
	, rm = _fs.rm
	, existsSync = _fs.existsSync;

var JS = 'js'
	, CSS = 'css'
	, HTML = 'html'
	, start = notify.start = +new Date();

module.exports = Builder;

/**
 * Constructor
 */
function Builder() {
	this._executeScript = bind(this._executeScript, this);
	this._buildTargets = bind(this._buildTargets, this);
	this._parseTargets = bind(this._parseTargets, this);
	this._validBuildType = bind(this._validBuildType, this);
	this.config = null;
	this.options = {
		compress: false,
		compile: false,
		lint: false,
		test: false,
		lazy: false,
		reload: false,
		verbose: false,
		watching: false,
		deploy: false,
		processors: null
	};
	this.sources = {
		js: null,
		css: null,
		html: null
	};
	this.targets = {
		js: [],
		css: [],
		html: []
	};
}

/**
 * Install dependencies as specified in config file found at 'configpath'
 * @param {String} configpath [file name or directory containing default]
 * @param {Boolean} verbose
 */
Builder.prototype.install = function(configpath, verbose) {
	var self = this;
	object.extend(this.options, {verbose: verbose});
	this._initialize(configpath, function(err) {
		if (err) error(err, 0);
		if (self.config.dependencies) {
			debug('INSTALL', 1);
			print('installing dependencies...', 2);
			dependencies.install(self.config.dependencies, function(err, files) {
				// Persist file references created on install
				if (files) filelog.add(files);
				if (err) error(err, 0);
				print("completed install in " + (colour((+new Date() - start) / 1000 + 's', notify.CYAN)), 2);
			});
		} else {
			error('no dependencies specified in configuration file', 2);
		}
	});
};

/**
 * Build sources based on targets specified in config
 * optionally 'compress'ing and 'lint'ing
 * @param {String} configpath [file name or directory containing default]
 * @param {Boolean} compress
 * @param {Boolean} lint
 * @param {Boolean} test
 * @param {Boolean} lazy
 * @param {Boolean} verbose
 * @param {Function} fn(err)
 */
Builder.prototype.build = function(configpath, compress, lint, test, lazy, verbose, fn) {
	var self = this;
	object.extend(this.options, {
		compress: compress,
		lint: lint,
		test: test,
		lazy: lazy,
		verbose: verbose
	});
	this._initialize(configpath, function(err) {
		if (err) error(err, 2);
		async.forEachSeries([JS, CSS], (function(type, cb) {
			var build = self.config.build[type]
				, opts;
			if (build) {
				if (self._validBuildType(build)) {
					// Generate source cache
					debug('SOURCE', 1);
					opts = object.clone(self.options);
					opts.processors = self.options.processors[type];
					self.sources[type] = new Source(type, build.sources, opts);
					self.sources[type].parse(function(err) {
						if (err) return cb("failed parsing sources " + (strong(build)));
						// Generate build targets
						debug('TARGET', 1);
						self._parseTargets(type, build.targets, function(err, instances) {
							// Parse errors shouldn't throw
							if (instances) {
								self.targets[type] = instances;
								// Build targets
								self._buildTargets(type, function(err) {
									if (err) return cb(err);
									cb();
								});
							} else {
								cb();
							}
						});
					});
				} else {
					return cb('invalid build configuration');
				}
			} else {
				cb();
			}
		}), function(err) {
			var script;
			if (err) {
				if(fn) fn(err);
				error(err, 2);
			}
			print("completed build in " + (colour((+new Date() - start) / 1000 + 's', notify.CYAN)), 2);
			if (fn) fn();
			// Run test script
			if (self.options.test && (script = self.config.settings.test)) {
				self._executeScript(function(script, err) {
					if (err) return error(err, 2);
				});
			}
		});
	});
};

/**
 * Build sources and watch for creation, changes, and deletion
 * optionally 'compress'ing and 'reload'ing the browser
 * @param {String} configpath [file name or directory containing default]
 * @param {Boolean} compress
 * @param {Boolean} reload
 * @param {Boolean} test
 * @param {Boolean} lazy
 * @param {Boolean} verbose
 */
Builder.prototype.watch = function(configpath, compress, reload, test, lazy, verbose) {
	var self = this;
	this.build(configpath, compress, false, test, lazy, verbose, function(err) {
		if (err) error(err, 2);
		debug('WATCH', 1);
		print('watching sources:', 2);
		[self.sources.js, self.sources.css].forEach(function(source) {
			if (source) {
				object.extend(source.options, {
					watching: true,
					reload: reload
				});
				source.watch(function(err, file) {
					// Watch error, don't throw
					if (err) {
						return error(err, 2, false);
					} else {
						start = new Date();
						// Clear content
						file.clearContent();
						self._buildTargets(source.type, function(err) {
							var script;
							// Build error, don't throw
							if (err) {
								return error(err, 2, false);
							} else {
								print("completed build in " + (colour((+new Date() - start) / 1000 + 's', notify.CYAN)), 3);
								// Run test script
								if (self.options.test && (script = self.config.settings.test)) {
									self._executeScript(function(script, err) {
										if (err) return error(err, 2);
									});
								}
							}
						});
					}
				});
			}
		});
	});
};

/**
 * Build and compress sources based on targets specified in configuration
 * @param {String} configpath [file name or directory containing default]
 * @param {Boolean} test
 * @param {Boolean} lazy
 * @param {Boolean} verbose
 */
Builder.prototype.deploy = function(configpath, test, lazy, verbose) {
	object.extend(this.options, {deploy: true});
	this.build(configpath, true, false, test, lazy, verbose);
};

/**
 * List all file system content created via installing and building
 * @param {Boolean} verbose
 */
Builder.prototype.list = function(verbose) {
	notify.verbose = verbose;
	filelog.load(function(err) {
		// List files
		debug('LIST', 1);
		print('listing generated files...', 2);
		filelog.files.forEach(function(file) {
			print("" + (strong(file)), 3);
		});
	});
};

/**
 * Remove all file system content created via installing and building
 * @param {Boolean} verbose
 */
Builder.prototype.clean = function(verbose) {
	notify.verbose = verbose;
	filelog.load(function(err) {
		// Delete files
		debug('CLEAN', 1);
		print('cleaning generated files...', 2);
		filelog.files.forEach(function(file) {
			print("" + (colour('deleted', notify.RED)) + " " + (strong(file)), 3);
			rm(path.resolve(file), function() {});
		});
		filelog.clean();
	});
};

/**
 * Initialize based on configuration located at 'configpath'
 * The directory tree will be walked if no 'configpath' specified
 * @param {String} configpath [file name or directory containing default]
 * @param {Boolean} verbose
 * @param {Function} fn()
 */
Builder.prototype._initialize = function(configpath, fn) {
	var self = this;
	notify.verbose = this.options.verbose;
	start = new Date();
	if (!this.initialized) {
		// Load configuration file
		configuration.load(configpath, function(err, data) {
			if (err) return fn(err);
			self.config = data;
			print("loaded config " + (strong(configuration.url)), 2);
			// Load filelog
			filelog.load(function() {});
			// Load and store processors
			processors.load(self.config.settings && self.config.settings.processors, function(err, installed) {
				if (err) return fn(err);
				self.options.processors = installed;
				self.initialized = true;
				fn();
			});
			// Register for uncaught errors and clean up
			process.on('uncaughtException', function(err) {
				dependencies.clean();
				[self.sources.js, self.sources.css].forEach(function(source) {
					if (source) source.clean();
				});
				// Ring bell
				if (self.options.watching) console.log('\x07');
				// throw err;
			});
		});
	} else {
		fn();
	}
};

/**
 * Check that a given 'build' is properly described in the target configuration
 * @param {String} build
 */
Builder.prototype._validBuildType = function(build) {
	return !!(build
		&& build.sources
		&& build.sources.length >= 1
		&& build.targets
		&& build.targets.length >= 1);
};

/**
 * Recursively cache all valid target instances specified in configuration
 * @param {String} type
 * @param {Array} targets
 * @param {Function} fn(err, instances)
 */
Builder.prototype._parseTargets = function(type, targets, fn) {
	var instances = []
		, outstanding = 0
		, self = this;

	// Inner function
	var parse = function(tgts, parent) {
		tgts.forEach(function(tgt) {
			// Create unique options object
			var opts = object.extend(object.clone(self.options), tgt);
			opts.parent = parent;
			opts.hasParent = !!parent;
			opts.hasChildren = !!opts.targets;
			opts.source = self.sources[type];
			opts.processors = opts.processors[type];
			// CSS targets are compiled at the target level because of @import inlining
			opts.compile = type == CSS;
			outstanding++;
			targetFactory(type, opts, function(err, instance) {
				outstanding--;
				// Parse errors shouldn't throw
				if (err) warn(err, 2);
				if (instance) {
					// Insert after parent
					if (opts.parent) {
						instances.splice(instances.indexOf(opts.parent) + 1, 0, instance);
					} else {
						instances.push(instance);
					}
					if (opts.targets) parse(opts.targets, instance);
				}
				if (!outstanding) return fn(null, instances);
			});
		});
	};

	parse(targets);
};

/**
 * Run all targets for a given 'type'
 * @param {String} type
 * @param {Function} fn(err)
 */
Builder.prototype._buildTargets = function(type, fn) {
	debug('BUILD', 1);
	async.forEachSeries(this.targets[type], (function(tgt, cb) {
		tgt.build(function(err, files) {
			// Persist file references created on build
			if (files) filelog.add(files);
			// Reset unless target has children
			if (!tgt.options.hasChildren) tgt.reset();
			// Return error
			if (err) return cb(err);
			// Reload
			tgt.options.source.refresh(path.basename(files[0]));
			cb();
		});
	}), function(err) {
		if (err) return fn(err);
		fn();
	});
};

/**
 * Run the script defined in config 'test'
 * @param {String} script
 * @param {Function} fn(err)
 */
Builder.prototype._executeScript = function(script, fn) {
	print('executing test script...', 2);
	debug("execute: " + (strong(this.config.settings.test)), 3);
	exec(script, function(err, stdout, stderr) {
		if (err) return fn(err);
		if (stdout) console.log(stdout);
		if (stderr) console.log(stderr);
		fn();
	});
};
