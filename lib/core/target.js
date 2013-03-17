var fs = require('fs')
	, path = require('path')
	, async = require('async')
	, object = require('../utils/object')
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong
	, colour = term.colour
	, print = term.print
	, warn = term.warn
	, fsutils = require('recur-fs')
	, indir = fsutils.indir
	, readdir = fsutils.readdir
	, mkdir = fsutils.mkdir
	, ignored = fsutils.ignored;

var BUILT_HEADER = '/*BUILT ';

/**
 * Target instance factory
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function(data) {
	var instance = new Target();
	object.extend(instance, data);
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
	this.options = null;
	this.fileFilter = null;
	this.input = '';
	this.output = '';
	this.inputpath = '';
	this.outputpath = '';
	this.outputpathCompressed = '';
	this.steps = null;
	this.isDir = false;
	this.modular = false;
	this.targets = null;
	this.parent = null;
	this.hasParent = false;
	this.hasChildren = false;
	*/
	this.sources = [];
	this.modifiedSources = [];
	this.generatedFiles = [];
}

Target.prototype.build = function(fn) {
	var self = this;
	this.sources = [];
	this.generatedFiles = [];

};

/**
 * Determine if a File exists in sources or a parent's
 * @param {File} file
 * @returns {Boolean}
 */
Target.prototype.hasSource = function(file) {
	return this.sources.indexOf(file) != -1
		|| this.hasParent && this.parent.hasSource(file);
};

/**
 * Reset modified files
 */
Target.prototype.reset = function() {
	if (this.hasParent) this.parent.reset();
};

