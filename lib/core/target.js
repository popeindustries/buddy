var clearIDCache = require('identify-resource').clearCache
	, clearTemplateCache = require('transfigure').clearCache
	, cnsl = require('../utils/cnsl')
	, colour = cnsl.colour
	, debug = cnsl.debug
	, error = cnsl.error
	, print = cnsl.print
	, strong = cnsl.strong
	, warn = cnsl.warn
	, fileFactory = require('./file')
	, fs = require('fs')
	, fsutils = require('recur-fs')
	, indir = fsutils.indir
	, inherit = require('util').inherits
	, lodash = require('lodash')
	, compact = lodash.compact
	, difference = lodash.difference
	, distinct = lodash.unique
	, extend = lodash.extend
	, flatten = lodash.flatten
	, path = require('path')
	, pathName = require('../utils/path').name
	, Promise = require('bluebird')
	, unique = require('../utils/unique')
	, readdir = Promise.promisify(fsutils.readdir);

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
	this.fileCache = null;
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
	this.fileOptions = {
		filepath: this.outputPath,
	};
	this.fileFilter = this.fileExtensions ? new RegExp(this.fileExtensions.join('$|') + '$') : null;
	this.referencedFiles = [];

	debug("created "
		+ this.type
		+ " Target instance with input: "
		+ (strong(this.input))
		+ " and output: "
		+ (strong(this.output)), 2);
}

/**
 * Run build
 * @returns {Promise(Array)}
 */
Target.prototype.build = function () {
	var self = this
		, watching = !this.outputPath && this.runtimeOptions.watch;

	// Don't build if no output and not watching
	if (this.outputPath || watching) {
		var timerID = Array.isArray(this.input)
				? this.input[0]
				: this.input
			, input;

		this.referencedFiles = [];

		cnsl.start(timerID);

		if (Array.isArray(this.inputPath)) {
			input = this.inputPath.map(function (input) {
				return pathName(input);
			});
			// Trim long lists
			if (input.length > 3) {
				input = input.slice(0, 3).join(', ')
					+ '...and '
					+ (input.length - 3)
					+ ' others';
			} else {
				input = input.join(', ')
			}
		} else {
			input = pathName(this.inputPath);
		}

		print((watching ? "watching " : "building ")
			+ (strong(input))
			+ (this.outputPath ? " to " + strong(path.basename(this.outputPath)) : ''), 2);

		// Execute 'before' hook
		return this.executeHook('before', this)
			.then(function () {
				// Parse and start build process
				return self.parse(self.isBatch, self.inputPath, self.fileFilter, self.fileFactoryOptions);
			}).then(function (files) {
				// Process files
				return self.process(files, self.workflow);
			}).then(function (files) {
				// Execute 'afterEach' hooks
				return Promise.all(files.map(function (file) {
					return self.executeHook('afterEach', file);
				})).return(files);
			}).then(function (files) {
				print("[processed "
					+ strong(self.referencedFiles.length)
					+ (self.referencedFiles.length > 1 ? " files" : " file")
					+ " in "
					+ colour((cnsl.stop(timerID) / 1000) + 's', cnsl.CYAN)
					+ "]", 3);
				// Write writeable files
				return self.write(files);
			}).then(function (filepaths) {
				if (self.hasChildren) {
					// Lock files to prevent inclusion in downstream targets
					self.lock(self.referencedFiles);
					// Build child targets in sequence
					// for (var i = 0, n = self.targets.length; i < n; i++) {
					// 	filepaths = filepaths.concat(yield self.targets[i].build());
					// }
					self.unlock(self.referencedFiles);
				}
				return filepaths;
			}).then(function (filepaths) {
				// Execute 'after' hook
				return self.executeHook('after', self)
					.return(filepaths);
			}).then(function (filepaths) {
				// Reset
				self.reset();
				// Return output paths on completion
				return filepaths;
			});
		}
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
Target.prototype.parse = Promise.method(function (isBatch, input, filter, options) {
	var files;

	// Input is directory or array
	if (isBatch) {
		// Grab all files (filtered by file extension)
		var inputs = !Array.isArray(input) ? [input] : input;
		var filepaths = (yield inputs.map(function (input) {
			if (!path.extname(input).length) {
				return readdir(input, filter);
			} else {
				return input;
			}
		})).reduce(function (a, b) {
			if (Array.isArray(b)) {
				return a.concat(b);
			} else {
				a.push(b);
				return a;
			}
		}, []);
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
});

/**
 * Process batch workflow 'commands' for 'files'
 * @param {Array} files
 * @param {Array} workflow
 * @returns {Array}
 */
Target.prototype.process = function* (files, workflow) {
	// Recursive batch run 'fls' with 'tasks'
	function* batch (fls, tasks) {
		// Run file tasks in parallel
		var deps = yield fls.map(function (fl) {
			return fl.run(tasks);
		});
		// Process files not yet processed
		deps = difference(distinct(flatten(compact(deps))), files);
		if (deps.length) {
			// Store
			files = files.concat(deps);
			yield batch(deps, tasks);
		}
	}

	yield batch(files, workflow[0]);

	// Store all referenced files
	this.referencedFiles = files;

	// Filter writeable files
	files = files.filter(function (file) {
		return file.getIsWriteable();
	});

	// Second set only operates on writeable files
	if (workflow.length > 1) {
		yield batch(files, workflow[1]);
	}

	return files;
};

/**
 * Write generated content
 * @param {Array} files
 * @returns {Promise(Array)}
 */
Target.prototype.write = function (files) {
	var options = {
				bootstrap: this.bootstrap,
				boilerplate: this.boilerplate
			}
		, file, filepath;

	// Write files in sequence
	return Promise.all(files.map(function (file) {
		file = files[i];
		// Don't write if no output path
		if (this.outputPath) {
			filepath = this.outputPath;
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
					filepath = file.filepath
						.replace(input, this.outputPath)
						// fix: add '.' to make sure to replace only the extension
						.replace('.' + file.extension, '.' + file.type);
				} else {
					filepath = path.join(filepath, file.id) + '.' + file.type;
				}
			}

			// Handle generating unique paths
			if (unique.isUniquePattern(filepath)) {
				// Remove existing
				var existing = unique.find(filepath);
				if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);

				// Generate unique path
				filepath = unique.generate(filepath, file.content);
			}

			// Write file
			return file.write(filepath, options);
		}
	}));
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
 * @returns {Promise}
 */
Target.prototype.executeHook = Promise.method(function (hook, context) {
	if (this[hook]) {
		print('executing ' + hook + ' hook...', 3);

		var done = function (err) {
			if (err) throw err;
		};

		// Make global objects available to the function
		return this[hook](global, process, console, require, context, this.runtimeOptions, done);
	}
});
