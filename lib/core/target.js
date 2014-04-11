// TODO: nothing to build, check parent sources

var Promise = require('bluebird')
	, fs = require('fs')
	, path = require('path')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, extend = require('lodash').extend
	, fileFactory = require('./file')
	, clearCache = require('identify-resource').clearCache
	, cnsl = require('../utils/cnsl')
	, error = cnsl.error
	, debug = cnsl.debug
	, strong = cnsl.strong
	, colour = cnsl.colour
	, print = cnsl.print
	, warn = cnsl.warn
	, fsutils = require('recur-fs')
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
	this.fileFilter = new RegExp(this.fileExtensions.join('$|') + '$');
	this.outputFiles = []; // Main output files
	this.outputPaths = []; // Main output paths

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
 * @returns {Promise(filepaths)}
 */
Target.prototype.build = function () {
	var self = this;

	// reset
	this.outputFiles = [];
	this.outputPaths = [];

	print("building "
		+ (strong(path.basename(this.inputPath)))
		+ " to "
		+ (strong(path.basename(this.outputPath))), 2);

	// Execute 'before' hook
	return self.executeHook('before', self)
		.then(function () {
			// Parse and start build process
			return self.parse(self.isDir, self.inputPath, self.fileFilter, self.fileFactoryOptions);
		}).then(function (files) {
			// Process files
			return self.process(files, self.workflow);
		}).then(function (files) {
			// Write files
			return self.write(files);
		}).then(function (filepaths) {
			// Execute 'after' hook
			return self.executeHook('after', self)
				// Return output paths on completion
				.return(filepaths);
		});
};

/**
 * Determine input sourceFiles and start processing
 * @param {Boolean} isDir
 * @param {String} input
 * @param {RegExp} filter
 * @param {Object} options
 * @returns {Promise(files)}
 */
Target.prototype.parse = function (isDir, input, filter, options) {
	var self = this
		, file, files;

	// Input is directory
	if (isDir) {
		// Grab all files (filtered by file extension)
		return readdir(input, filter, null)
			.spread(function (filepaths, dirs) {
				// Create file instances
				files = filepaths.map(function (filepath) {
					return fileFactory(filepath, options);
				}).filter(function (file) {
					return file != null;
				});
				if (!files.length) warn('no valid source files found in ' + strong(input), 4);
				return Promise.resolve(files);
			});

	// Input is file
	} else {
		// Create File instance
		file = fileFactory(input, options);
		if (!file) {
			warn(strong(input) + ' not found in project sources', 4);
			files = [];
		} else {
			files = [file];
		}
		return Promise.resolve(files);
	}
};

/**
 * Process workflow 'commands' for 'files'
 * @param {Array} files
 * @param {Array} commands
 * @returns {Promise(files)}
 */
Target.prototype.process = function (files, commands) {
	var self = this;

	if (files.length) {
		return Promise.all(files.map(function (file) {
			return file.run(commands);
		})).return(files);
	} else {
		return Promise.resolve(files);
	}
};

/**
 * Write generated content
 * @param {Array} files
 * @returns {Promise(filepaths)}
 */
Target.prototype.write = function (files) {
	var self = this
		, filepaths = []
		, options = {
				bootstrap: this.bootstrap,
				boilerplate: this.boilerplate
			}
		, filepath;

	// Loop through all files
	return Promise.all(files.map(function (file) {
		if (file.isWriteable) {
			filepath = self.outputPath;
			// Resolve output path if directory
			if (!path.extname(filepath).length) filepath = path.join(filepath, file.id) + '.' + file.type;

			// Execute 'afterEach' hook
			return self.executeHook('afterEach', file)
			.then(function () {
				// Write file
				return file.write(filepath, options);
			}).then(function (filepath) {
				// Store
				filepaths.push(filepath);
				// return filepath;
			});
		} else {
			return Promise.resolve();
		}
	})).return(filepaths);
};

/**
 * Reset modified files
 */
Target.prototype.reset = function () {
	this.outputFiles.forEach(function (file) {
		file.reset();
	});
	this.outputFiles = [];
	if (this.hasParent) this.parent.reset();
	clearCache();
};

/**
 * Execute the 'hook' function with a particular 'context'
 * @param {String} hook
 * @param {Object} context
 * @returns {Promise}
 */
Target.prototype.executeHook = function (hook, context) {
	if (this[hook]) {
		print('executing ' + hook + ' hook...', 3);

		// Generate hook promise and callback
		var h = Promise.method(this[hook])
			, done = function (err) {
					if (err) throw err;
				};

		// Make global objects available to the function
		return h(global, process, console, require, context, this.runtimeOptions, done);
	} else {
		return Promise.resolve();
	}
};
