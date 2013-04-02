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
	, mkdir = fsutils.mkdir
	, watcher = new (require('yaw'));

/**
 * Target instance factory
 * @param {Cache} fileCache
 * @param {Object} data
 * @returns {Target}
 */
module.exports = function(fileCache, data) {
	var instance = new Target(fileCache, data);
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
	this.sourceFiles = []; // All source files
	this.outputFiles = []; // Main output files
	this.outputPaths = []; // Main output paths

	// Setup watch handlers
	if (this.runtimeOptions.watch) {
		watcher.on('change', this.onWatchChange.bind(this));
		watcher.on('delete', this.onWatchDelete.bind(this));
		watcher.on('error', this.onWatchError.bind(this));
	}

	EventEmitter.call(this);
}

// Inherit
inherit(Target, EventEmitter);

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
			async.map(files, self.getFile.bind(self), function(err, files) {
				if (err) return fn(err);
				// Store
				self.outputFiles = files;
				// Process files
				self.process(files, self.workflow, fn);
			});
		});
	// Input is file
	} else {
		// Create File instance
		this.getFile(this.inputPath, function(err, file) {
			if (err) return fn(err);
			// Store
			self.outputFiles.push(file);
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
	// Check cache
	if (this.fileCache.hasItem(filepath)) {
		fn(null, this.fileCache.getItem(filepath));
	// Create
	} else {
		fileFactory(filepath, this.fileFactoryOptions, function(err, file) {
			if (err) return fn(err);
			// Read file contents
			file.read(function(err, file) {
				if (err) return fn(err);
				// Store
				if (!self.hasSource(file)) {
					self.sourceFiles.push(file);
					self.fileCache.addItem(file.filepath, file);
					// Watch
					if (self.runtimeOptions.watch) watcher.watch(file.filepath);
				}
				fn(null, file);
			});
		});
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
		async.map(file.dependencies, self.getFile.bind(self), function(err, dependencies) {
			// Process dependencies
			dependencies.length
				? self.process(dependencies, commands, cb)
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
 * @param {File} file
 * @param {Boolean} unique
 * @returns {Boolean}
 */
Target.prototype.hasSource = function(file, unique) {
	return ~this.sourceFiles.indexOf(file)
		|| unique ? true : this.hasParent && this.parent.hasSource(file);
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

/**
 * Handle changes to watched files
 * @param {String} filepath
 * @param {Stats} stats
 */
Target.prototype.onWatchChange = function(filepath, stats) {
	var self = this
		, file = this.fileCache.getItem(filepath);
	// Reset file
	if (this.hasSource(file, true)) {
		file.reset(true);
		// Read new content and notify
		file.read(function(err, file) {
			if (err) return error(err, 2);
			self.emit('change');
		});
	}
};

/**
 * Handle deleted watched files
 * @param {String} filepath
 */
Target.prototype.onWatchDelete = function(filepath) {
	var file = this.fileCache.getItem(filepath);
	// Destroy file
	if (this.hasSource(file, true)) {
		file.destroy();
		this.fileCache.removeItem(file);
	}
};

/**
 * Handle error watching files
 * @param {Error} err
 */
Target.prototype.onWatchError = function(err) {
	return error(err, 2);
};