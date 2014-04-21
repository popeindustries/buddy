// TODO: nothing to build, check parent sources

var co = require('co')
	, thunkify = require('thunkify')
	, fs = require('fs')
	, path = require('path')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, lodash = require('lodash')
	, extend = lodash.extend
	, flatten = lodash.flatten
	, unique = lodash.unique
	, difference = lodash.difference
	, compact = lodash.compact
	, fileFactory = require('./file')
	, clearIDCache = require('identify-resource').clearCache
	, cnsl = require('../utils/cnsl')
	, error = cnsl.error
	, debug = cnsl.debug
	, strong = cnsl.strong
	, colour = cnsl.colour
	, print = cnsl.print
	, warn = cnsl.warn
	, fsutils = require('recur-fs')
	// readdir thunk
	, readdir = function (dir, filter) {
			return function (fn) {
				fsutils.readdir(dir, filter, null, function (err, filepaths, dirpaths) {
					if (err) return fn(err);
					fn(null, filepaths);
				});
			}
		};

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
	this.isDir = false;
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

	EventEmitter.call(this);

	debug("created "
		+ this.type
		+ " Target instance with input: "
		+ (strong(this.input))
		+ " and output: "
		+ (strong(this.output)), 2);
}

// Inherit
inherit(Target, EventEmitter);

/**
 * Run build
 * @returns {Array}
 */
Target.prototype.build = function * () {
	cnsl.start(this.input);

	print("building "
		+ (strong(path.basename(this.inputPath)))
		+ " to "
		+ (strong(path.basename(this.outputPath))),
	2);

	// Execute 'before' hook
	if (this.before) yield this.executeHook('before', this);
	// Parse and start build process
	var files = yield this.parse(this.isDir, this.inputPath, this.fileFilter, this.fileFactoryOptions);
	// Process files
	files = yield this.process(files, this.workflow);
	// Execute 'afterEach' hooks
	if (this.afterEach) {
		yield files.map(function (file) {
			return this.executeHook('afterEach', file);
		}, this);
	}
	print("[processed "
		+ strong(this.referencedFiles.length)
		+ (this.referencedFiles.length > 1 ? " files" : " file")
		+ " in "
		+ colour((cnsl.stop(this.input) / 1000) + 's', cnsl.CYAN)
		+ "]",
	3);
	// Write writeable files
	var filepaths = yield this.write(files);
	if (this.hasChildren) {
		// Lock files to prevent inclusion in downstream targets
		this.lock(this.referencedFiles);
		// Build child targets in sequence
		for (var i = 0, n = this.targets.length; i < n; i++) {
			filepaths = filepaths.concat(yield this.targets[i].build());
		}
		this.unlock(this.referencedFiles);
	}
	// Execute 'after' hook
	if (this.after) yield this.executeHook('after', this);

	// Reset
	this.reset();

	// Return output paths on completion
	return filepaths;
};

/**
 * Parse 'input' source files
 * @param {Boolean} isDir
 * @param {String} input
 * @param {RegExp} filter
 * @param {Object} options
 * @returns {Array}
 */
Target.prototype.parse = function * (isDir, input, filter, options) {
	var files;

	// Input is directory
	if (isDir) {
		// Grab all files (filtered by file extension)
		var filepaths = yield readdir(input, filter);
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
 * @returns {Array}
 */
Target.prototype.process = function * (files, workflow) {
	// Recursive batch run 'fls' with 'tasks'
	function * batch (fls, tasks) {
		// Run file tasks in parallel
		var deps = yield fls.map(function (fl) {
			return fl.run(tasks);
		});
		// Process files not yet processed
		deps = difference(unique(flatten(compact(deps))), files);
		if (deps.length) {
			// Store
			files = files.concat(deps);
			yield batch(deps, tasks);
		}
	}

	yield batch(files, workflow[0]);

	// Store all referenced files
	this.referencedFiles = files;

	// Second set is filtered on writeability
	if (workflow.length > 1) {
		// Filter writeable files
		files = files.filter(function (file) {
			return file.getIsWriteable();
		});
		yield batch(files, workflow[1]);
	}

	return files;
};

/**
 * Write generated content
 * @param {Array} files
 * @returns {Array}
 */
Target.prototype.write = function * (files) {
	var options = {
				bootstrap: this.bootstrap,
				boilerplate: this.boilerplate
			}
		, filepaths = []
		, file, filepath;

	// Write files in sequence
	for (var i = 0, n = files.length; i < n; i++) {
		file = files[i];
		filepath = this.outputPath;
		// Resolve output path if directory
		if (!path.extname(filepath).length) filepath = path.join(filepath, file.id) + '.' + file.type;
		// Store
		filepaths.push(filepath);

		// Write file
		yield file.write(filepath, options);
	}

	return filepaths;
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
 * Reset modified files
 */
Target.prototype.reset = function () {
	this.referencedFiles.forEach(function (file) {
		file.reset();
	});
	this.referencedFiles = [];
	clearIDCache();
};

/**
 * Execute the 'hook' function with a particular 'context'
 * @param {String} hook
 * @param {Object} context
 */
Target.prototype.executeHook = function (hook, context) {
	var hook = this[hook];
	print('executing ' + hook + ' hook...', 3);

	// Return thunk
	return function (done) {
		// Make global objects available to the function
		hook(global, process, console, require, context, this.runtimeOptions, done);
	}
};
