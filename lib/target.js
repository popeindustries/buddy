'use strict';

var async = require('async')
	, chalk = require('chalk')
	, clearIDCache = require('identify-resource').clearCache
	, clearTemplateCache = require('transfigure').clearCache
	, cnsl = require('./utils/cnsl')
	, compact = require('lodash/array/compact')
	, difference = require('lodash/array/difference')
	, distinct = require('lodash/array/unique')
	, extend = require('lodash/object/extend')
	, fileFactory = require('./file')
	, flatten = require('lodash/array/flatten')
	, fs = require('fs')
	, fsutils = require('recur-fs')
	, path = require('path')
	, pathName = require('./utils/path').name
	, unique = require('./utils/unique')

	, debug = cnsl.debug
	, error = cnsl.error
	, indir = fsutils.indir
	, parallel = async.parallel
	, print = cnsl.print
	, readdir = fsutils.readdir.sync
	, series = async.series
	, strong = cnsl.strong
	, warn = cnsl.warn
	, waterfall = async.waterfall;

/**
 * Target instance factory
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function (data) {
	var instance = new Target(data);
	return instance;
};

/**
 * Constructor
 * @param {Object} options
 */
function Target (options) {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.runtimeOptions = null;
	this.fileExtensions = null;
	this.input = '';
	this.output = '';
	this.inputPath = '';
	this.outputPath = '';
	this.workflow = null;
	this.isBatch = false;
	this.isAppServer = false;
	this.modular = false;
	this.targets = null;
	this.parent = null;
	this.hasChildren = false;
	this.bootstrap = false;
	this.boilerplate = false;
*/
	extend(this, options);
	this.fileFactoryOptions = {
		type: this.type,
		fileExtensions: this.fileExtensions,
		sources: this.sources,
		runtimeOptions: this.runtimeOptions
	};
	this.fileFilter = this.fileExtensions ? new RegExp(this.fileExtensions.join('$|') + '$') : null;
	this.referencedFiles = [];
	// Handle printing long input arrays
	if (Array.isArray(this.inputPath)) {
		this.inputString = this.inputPath.map(function (input) {
			return pathName(input);
		});
		// Trim long lists
		if (this.inputString.length > 3) {
			this.inputString = this.inputString.slice(0, 3).join(', ')
				+ '...and '
				+ (this.inputString.length - 3)
				+ ' others';
		} else {
			this.inputString = this.inputString.join(', ')
		}
	} else {
		this.inputString = pathName(this.inputPath);
	}

	debug('created '
		+ this.type
		+ ' Target instance with input: '
		+ strong(this.inputString)
		+ ' and output: '
		+ strong(this.output), 2);
}

/**
 * Run build
 * @param {Function} fn(err, filepaths)
 */
Target.prototype.build = function (fn) {
	var self = this
		, watching = !this.outputPath && this.runtimeOptions.watch;

	// Don't build if no output and not watching
	if (this.outputPath || watching) {
		var timerID = Array.isArray(this.input)
			? this.input[0]
			: this.input;

		this.referencedFiles = [];

		cnsl.start(timerID);

		print((watching ? 'watching ' : 'building ')
			+ strong(this.inputString)
			+ (this.outputPath ? ' to ' + strong(path.basename(this.outputPath)) : ''), 2);

		// Execute 'before' hook
		waterfall([function (done) {
			self.executeHook('before', self, done);
		},
		// Parse and start build process
		function (done) {
			done(null, self.parse(self.isBatch, self.inputPath, self.fileFilter, self.fileFactoryOptions));
		},
		// Process files
		function (files, done) {
			self.process(files, self.workflow, done);
		},
		// Execute 'afterEach' hooks
		function (files, done) {
			parallel(files.map(function (file) {
				// Memoize
				return self.executeHook.bind(self, 'afterEach', file);
			}), function (err) {
				done(err, files);
			});
		},
		// Write writeable files
		function (files, done) {
			print('[processed '
				+ strong(self.referencedFiles.length)
				+ (self.referencedFiles.length > 1 ? ' files' : ' file')
				+ ' in '
				+ chalk.cyan((cnsl.stop(timerID) / 1000) + 's')
				+ ']', 3);
			done(null, self.write(files));
		},
		// Build child targets
		function (filepaths, done) {
			if (self.hasChildren) {
				// Lock files to prevent inclusion in downstream targets
				self.lock(self.referencedFiles);
				series(self.targets.map(function (target) {
					return target.build.bind(target);
				}), function (err, results) {
					// Add new filepaths
					filepaths = filepaths.concat(flatten(results));
					self.unlock(self.referencedFiles);
					done(err, filepaths);
				});
			} else {
				done(null, filepaths);
			}
		},
		// Execute 'after' hook
		function (filepaths, done) {
			self.executeHook('after', self, function (err) {
				done(err, filepaths);
			});
		},
		// Reset
		function (filepaths, done) {
			self.reset();
			done(null, filepaths);
		}], fn);
	} else {
		fn();
	}
};

/**
 * Parse 'input' source files
 * @param {Boolean} isBatch
 * @param {String|Array} input
 * @param {RegExp} filter
 * @param {Object} options
 * @returns {Array}
 */
Target.prototype.parse = function (isBatch, input, filter, options) {
	var files;

	// Input is directory or array
	if (isBatch) {
		// Grab all files (filtered by file extension)
		var inputs = !Array.isArray(input) ? [input] : input;
		var filepaths = flatten(inputs.map(function (input) {
			// Directory
			if (!path.extname(input).length) {
				return readdir(input, function (resource, stat) {
					// Apply filter if it exists
					var test = filter ? filter.test(resource) : true;
					return stat.isFile() && test;
				});
			} else {
				return input;
			}
		}));
		// Create file instances
		files = filepaths.map(function (filepath) {
			return fileFactory(filepath, options);
		}).filter(function (file) {
			return file != null;
		});
		if (!files.length) warn('no valid source files found in ' + strong(input), 4);

	// Input is file
	} else {
		// Create File instance
		var file = fileFactory(input, options);
		file.isRoot = true;
		if (!file) {
			warn(strong(input) + ' not found in project sources', 4);
			files = [];
		} else {
			files = [file];
		}
	}

	return files;
};

/**
 * Process batch workflow 'commands' for 'files'
 * @param {Array} files
 * @param {Array} workflow
 * @param {Function} fn(err, files)
 */
Target.prototype.process = function (files, workflow, fn) {
	var self = this;

	// Recursive batch run 'someFiles' with 'tasks'
	function batch (someFiles, tasks, done) {
		// Run file tasks in parallel
		parallel(someFiles.map(function (file) {
			// Memoize
			return file.run.bind(file, tasks);
		}), function (err, dependencies) {
			if (err) return done(err);
			// Process files not yet processed
			dependencies = difference(distinct(flatten(compact(dependencies))), files);
			if (dependencies.length) {
				// Store
				files = files.concat(dependencies);
				return batch(dependencies, tasks, done);
			} else {
				done(null, files);
			}
		});
	}

	// Batch run first set of workflow tasks
	batch(files, workflow[0], function (err) {
		if (err) return fn(err);

		// Store all referenced files
		self.referencedFiles = files;

		// Filter writeable files
		files = files.filter(function (file) {
			return file.getIsWriteable();
		});

		// Second set only operates on writeable files
		if (workflow.length > 1) {
			batch(files, workflow[1], fn);
		} else {
			fn(null, files);
		}
	});
};

/**
 * Write generated content
 * @param {Array} files
 * @returns {Array}
 */
Target.prototype.write = function (files) {
	var options = {
		bootstrap: this.bootstrap,
		boilerplate: this.boilerplate
	};

	// Write files in sequence
	return files.map(function (file) {
		// Don't write if no output path
		if (this.outputPath) {
			var filepath = this.outputPath;
			// Resolve output path if directory
			if (!path.extname(filepath).length) {
				var inSources = !!this.sources.filter(function (source) {
					return indir(source, this.outputPath);
				}, this).length;
				// Swap input for output path if in sources in order to preserve relative package structure
				if (inSources) {
					var input = Array.isArray(this.inputPath) ? file.filepath : this.inputPath;
					// Resolve directory if input is a file
					if (path.extname(input).length) input = path.dirname(input);
					filepath = file.filepath.replace(input, this.outputPath);
				} else {
					filepath = path.join(filepath, file.id);
				}
				var extension = path.extname(filepath);
				if (!extension) filepath += '.' + file.type;
				if (extension != '.' + file.type) filepath = filepath.replace(extension, '.' + file.type);
			}

			// Handle generating unique paths
			if (unique.isUniquePattern(filepath)) {
				// Remove existing
				var existing = unique.find(filepath);
				if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);

				// Generate unique path
				// Disable during watch otherwise css reloading won't work
				filepath = unique.generate(filepath, !this.runtimeOptions.watch ? file.content : false);
			}

			// Write file
			return file.write(filepath, options);
		}

	}, this);
};

/**
 * Set lock flag for 'files'
 * @param {Array} files
 */
Target.prototype.lock = function (files) {
	files.forEach(function (file) {
		file.isLocked = true;
	});
};

/**
 * Unset lock flag for 'files'
 * @param {Array} files
 */
Target.prototype.unlock = function (files) {
	files.forEach(function (file) {
		file.isLocked = false;
	});
};

/**
 * Determine if 'file' is a referenced file (child targets included)
 * @param {File} file
 * @returns {Boolean}
 */
Target.prototype.hasFile = function (file) {
	var referenced;

	referenced = ~this.referencedFiles.indexOf(file);
	if (referenced) {
		return true;
	} else if (this.hasChildren) {
		for (var i = 0, n = this.targets.length; i < n; i++) {
			referenced = this.targets[i].hasFile(file);
			if (referenced) return true;
		}
	}
	return false;
};

/**
 * Reset modified files
 */
Target.prototype.reset = function () {
	this.referencedFiles.forEach(function (file) {
		file.reset();
	});
	clearIDCache();
	clearTemplateCache();
};

/**
 * Execute the 'hook' function with a particular 'context'
 * @param {String} hook
 * @param {Object} context
 * @param {Function} fn(err)
 */
Target.prototype.executeHook = function (hook, context, fn) {
	if (this[hook]) {
		print('executing ' + hook + ' hook...', 3);
		// Make global objects available to the function
		this[hook](global, process, console, require, context, this.runtimeOptions, fn);
	} else {
		fn();
	}
};
