// TODO: nothing to build, check parent sources

var fs = require('fs')
	, path = require('path')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, async = require('async')
	, extend = require('lodash').extend
	, fileFactory = require('./file')
	, term = require('buddy-term')
	, error = term.error
	, debug = term.debug
	, strong = term.strong
	, colour = term.colour
	, print = term.print
	, warn = term.warn
	, fsutils = require('recur-fs')
	, indir = fsutils.indir
	, readdir = fsutils.readdir
	, mkdir = fsutils.mkdir;

/**
 * Target instance factory
 * @param {Cache} fileCache
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function(fileCache, data) {
	var instance = new Target(fileCache, data);
	return instance;
};

/**
 * Constructor
 * @param {Cache} fileCache
 * @param {Object} options
 */
function Target(fileCache, options) {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.runtimeOptions = null;
	this.fileCache = null;
	this.fileFilter = null;
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
*/
	extend(this, options);
	this.fileFactoryOptions = {
		type: this.type,
		fileExtensions: this.fileExtensions,
		sources: this.sources,
		runtimeOptions: this.runtimeOptions,
	};
	this.fileOptions = {
		filepath: this.outputPath,
		fileCache: fileCache
	};
	this.fileCache = fileCache;
	this.sourceFiles = {}; // All source files
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

Target.prototype.build = function(fn) {
	var self = this;
	this.sourceFiles = {};
	this.outputFiles = [];
	this.outputPaths = [];
	print("building "
		+ (strong(path.basename(this.inputPath)))
		+ " to "
		+ (strong(path.basename(this.outputPath))), 2);
	this.parse(function(err) {
		return fn(err, self.outputPaths);
	});
};

/**
 * Determine input sourceFiles and start processing
 * @param {Function} fn(err)
 */
Target.prototype.parse = function(fn) {
	var self = this
		, file;
	// Input is directory
	if (this.isDir) {
		// Grab all files
		readdir(this.inputPath, this.fileFilter, null, function(err, files) {
			// Create File instances
			files = files.map(function(file) {
				return self.getFile(file);
			}).filter(function(file) {
				return file != null;
			});
			// Store
			self.outputFiles = files;
			// Process files
			files.length
				? self.process(files, self.workflow, fn)
				: setImmediate(fn);
		});
	// Input is file
	} else {
		// Create File instance
		file = this.getFile(this.inputPath);
		// Store
		this.outputFiles.push(file);
		// Process
		this.process(this.outputFiles, this.workflow, fn);
	}
};

/**
 * Get unprocessed 'file' instance
 * @param {String} filepath
 * @param {Function} fn(err, file)
 */
Target.prototype.getFile = function(filepath) {
	var file;
	// Only return unprocessed files
	if (!this.hasSource(filepath)) {
		// Create
		if (!this.fileCache.hasFile(filepath)) {
			file = fileFactory(filepath, this.fileFactoryOptions);
			if (file) {
				// Store
				this.sourceFiles[filepath] = file;
				this.fileCache.addFile(file.filepath, file);
				return file;
			} else {
				warn(strong(filepath) + ' not found in project sources');
				return null;
			}
		// Pull from cache and reset
		} else {
			file = this.fileCache.getFile(filepath);
			// Reset in case used by another non-relative target
			file.reset();
			// Store
			this.sourceFiles[filepath] = file;
			return file;
		}
	} else {
		return null;
	}
};

/**
 * Process workflow 'commands' for 'files'
 * @param {Array} files
 * @param {Array} commands
 * @param {Function} fn(err)
 */
Target.prototype.process = function(files, commands, fn) {
	var self = this;

	// Loop through commands
	async.eachSeries(commands, function(command, cb1) {
		// Handle target level commands
		if (~command.indexOf('target:')) {
			self[command.split(':')[1]](files, cb1);
		} else {
			// Loop through files and apply command
			async.each(files, function(file, cb2) {
				file[command](self.fileOptions, cb2);
			}, cb1);
		}
	}, fn);
};

/**
 * Filter 'files' to remove dependencies
 * @param {Array} files
 * @param {Function} fn
 */
Target.prototype.filter = function(files, fn) {
	var i = files.length;
	while(i--) {
		if (files[i].isDependency) files.splice(i, 1);
	}
	fn();
};

/**
 * Resolve dependencies in 'files', generating new instances as needed
 * @param {Array} files
 * @param {Function} fn
 */
Target.prototype.resolve = function(files, fn) {
	var self = this
		, commands = this.workflow.slice(0, this.workflow.indexOf('target:resolve') + 1)
		, outstanding = 0
		, dependencies;
	// Callback
	var cb = function(err) {
		outstanding--;
		if(err) return fn(err);
		if(!outstanding) fn();
	};
	// Loop through files
	files.forEach(function(file) {
		outstanding++;
		// Get all unstored dependency File instances
		dependencies = file.dependencies.map(function(dependency) {
			return self.getFile(dependency.filepath);
		}).filter(function(dependency) {
			return dependency != null;
		});
		// Process
		dependencies.length
			? self.process(dependencies, commands, cb)
			: setImmediate(cb);
	});
};

/**
 * Write generated content
 * @param {Array} files
 * @param {Function} fn
 */
Target.prototype.write = function(files, fn) {
	var self = this;
	async.each(files, function(file, cb) {
		file.write(self.fileOptions, function(err, filepath) {
			if (err) return cb(err);
			// Store
			self.outputPaths.push(filepath);
			cb();
		});
	}, fn);
};

/**
 * Determine if a File exists in sources, or a parent's if not 'unique'
 * @param {String} filepath
 * @param {Boolean} unique
 * @returns {Boolean}
 */
Target.prototype.hasSource = function(filepath, unique) {
	return this.sourceFiles[filepath] != null
		|| unique ? true : this.hasParent && this.parent.hasSource(filepath);
};

/**
 * Reset modified files
 */
Target.prototype.reset = function() {
	for (filepath in this.sourceFiles) {
		this.sourceFiles[filepath].reset();
	}
	this.sourceFiles = {};
	if (this.hasParent) this.parent.reset();
};
