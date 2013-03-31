// TODO: nothing to build, check parent sources

var fs = require('fs')
	, path = require('path')
	, async = require('async')
	, extend = require('lodash').extend
	, fileFactory = require('./file')
	, term = require('buddy-term')
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
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function(data) {
	var instance = new Target();
	extend(instance, data);
	instance.fileFactoryOptions = {
		type: instance.type,
		fileExtensions: instance.fileExtensions,
		sources: instance.sources
	};
	// debug("created "
	// 	+ instance.type
	// 	+ " Target instance with input: "
	// 	+ (strong(instance.input))
	// 	+ " and output: "
	// 	+ (strong(instance.output)), 2);
	return instance;
};

/**
 * Constructor
 */
function Target() {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.options = null;
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
	this.sourceFiles = []; // All source files
	this.outputFiles = []; // Main output files
	this.outputPaths = []; // Main output paths
}

Target.prototype.build = function(fn) {
	var self = this;
	this.sourceFiles = [];
	this.outputFiles = [];
	this.outputPaths = [];
	// if (!this.options.watch) {
	// 	print("building "
	// 		+ (strong(path.basename(this.inputPath)))
	// 		+ " to "
	// 		+ (strong(path.basename(this.outputPath))), 2);
	// }
	this.parse(function(err) {
		return fn(err, self.outputPaths);
	});
};

/**
 * Determine input sourceFiles and start processing
 * @param {Function} fn(err)
 */
Target.prototype.parse = function(fn) {
	var self = this;
	// Input is directory
	if (this.isDir) {
		// Grab all files
		readdir(this.inputPath, this.fileFilter, null, function(err, files) {
			// Create File instances
			async.each(files, self.getFile.bind(self), function(err) {
				if (err) return fn(err);
				// Process files
				self.process(self.outputFiles, self.workflow, fn);
			});
		});
	// Input is file
	} else {
		// Create File instance
		this.getFile(this.inputPath, function(err, file) {
			if (err) return fn(err);
			// Process file
			self.process(self.outputFiles, self.workflow, fn);
		});
	}
};

/**
 * Get 'file' instance and read contents
 * @param {String} file
 * @param {Function} fn(err, file)
 */
Target.prototype.getFile = function(filepath, fn) {
	var self = this;
	// Resolve if passed object
	if (typeof 'string' != filepath && filepath.filepath) filepath = filepath.filepath;
	fileFactory(filepath, this.fileFactoryOptions, function(err, file) {
		if (err) return fn(err);
		// Read file contents
		file.read(function(err, file) {
			if (err) return fn(err);
			// Store
			if (!self.hasSource(file)) {
				self.sourceFiles.push(file);
				self.outputFiles.push(file);
			}
			fn(null, file);
		});
	});
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
				file[command](self.options, cb2);
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
 * Resolve dependencies in 'files'
 * @param {Array} files
 * @param {Function} fn
 */
Target.prototype.resolve = function(files, fn) {
	var self = this
		, commands = this.workflow.slice(0, this.workflow.indexOf('target:resolve') + 1)
		, outstanding = 0;
	// Callback
	var cb = function(err) {
		outstanding--;
		if(err) return fn(err);
		if(!outstanding) fn();
	};
	// Loop through files
	files.forEach(function(file) {
		outstanding++;
		// Get all dependency File instances
		async.map(file.dependencies, self.getFile.bind(self), function(err, results) {
			// Process dependencies
			results.length
				? self.process(results, commands, cb)
				: cb();
		});
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
		file.write(self.options, function(err, filepath) {
			if (err) return cb(err);
			// Store
			self.outputPaths.push(filepath);
			cb();
		});
	}, fn);
};

/**
 * Determine if a File exists in sourceFiles or a parent's
 * @param {File} file
 * @returns {Boolean}
 */
Target.prototype.hasSource = function(file) {
	return ~this.sourceFiles.indexOf(file)
		|| this.hasParent && this.parent.hasSource(file);
};

/**
 * Reset modified files
 */
Target.prototype.reset = function() {
	this.sourceFiles.forEach(function(file) {
		file.reset();
	});
	this.sourceFiles = [];
	if (this.hasParent) this.parent.reset();
};

