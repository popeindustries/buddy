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

var BUILT_HEADER = '/*BUILT ';

/**
 * Target instance factory
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function(data) {
	var instance = new Target();
	extend(instance, data);
	instance.fileOptions = {
		type: instance.type,
		fileExtensions: instance.fileExtensions,
		sources: instance.sources
	};
	debug("created "
		+ instance.type
		+ " Target instance with input: "
		+ (strong(instance.input))
		+ " and output: "
		+ (strong(instance.output)), 2);
	return instance;
};

/**
 * Constructor
 * @param {Object} options
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
	this.inputpath = '';
	this.outputpath = '';
	this.workflow = null;
	this.isDir = false;
	this.modular = false;
	this.targets = null;
	this.parent = null;
	this.hasChildren = false;
*/
	this.inputFiles = [];
	this.modified = [];
	this.outputFiles = [];
}

Target.prototype.build = function(fn) {
	var self = this;
	this.inputFiles = [];
	this.outputFiles = [];
	if (!this.options.watch) {
		print("building "
			+ (strong(path.basename(this.inputpath)))
			+ " to "
			+ (strong(path.basename(this.outputpath))), 2);
	}
	this.parse(fn);
};

Target.prototype.parse = function(fn) {
	var self = this
		, outstanding = 0;
	// Input is directory
	if (this.isDir) {
		// Grab all files
		readdir(this.inputpath, this.fileFilter, null, function(err, files) {
			// Create File instances
			files.forEach(function(filepath) {
				outstanding++;
				this.createFile(filepath, function(err, file) {
					if (err) return fn(err);
					self.work(file, function(err, file) {
						outstanding--;
						if (err) return fn(err);
						if (!outstanding) fn();
					});
				});
			});
		});
	// Input is file
	} else {
		this.createFile(this.inputpath, function(err, file) {
			if (err) return fn(err);
			return self.work(file, fn);
		});
	}
};

Target.prototype.work = function(file, fn) {

};

Target.prototype.createFile = function(filepath, fn) {
	var self = this;
	fileFactory(filepath, this.fileOptions, function(err, file) {
		if (err) return fn(err);
		// Read file contents
		file.read(function(err, file) {
			if (err) return fn(err);
			// Store
			self.inputFiles.push(file);
			return fn();
		});
	});
};

// /**
//  * Determine if a File exists in inputFiles or a parent's
//  * @param {File} file
//  * @returns {Boolean}
//  */
// Target.prototype.hasFile = function(file) {
// 	return ~this.inputFiles.indexOf(file)
// 		|| this.hasParent && this.parent.hasSource(file);
// };

/**
 * Reset modified files
 */
Target.prototype.reset = function() {
	if (this.hasParent) this.parent.reset();
};

