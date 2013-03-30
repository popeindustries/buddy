// TODO: lint, built header

var path = require('path')
	, async = require('async')
	, transfigure = require('transfigure')
	, identify = require('identify-resource')
	, lodash = require('lodash')
	, extend = lodash.extend
	, clone = lodash.clone
	, compress = require('./file/compress')
	, concat = require('./file/concat')
	, escape = require('./file/escape')
	, parse = require('./file/parse')
	, read = require('./file/read')
	, wrap = require('./file/wrap')
	, wrap = require('./file/wrap')
	, write = require('./file/write')
	, term = require('buddy-term')
	, warn = term.warn
	, debug = term.debug
	, strong = term.strong
	, cache = {};

/**
 * File instance factory
 * @param {String} filepath
 * @param {Object} options
 * @param {Function} fn(err, instance)
 */
module.exports = function(filepath, options, fn) {
	var id, instance;
	// Return cached if it exists
	if (cache[filepath]) {
		instance = cache[filepath];
	} else {
		// Create new instance
		if (id = identify(filepath, options)) {
			instance = new File(id, filepath);
			extend(instance, options);
			cache[filepath] = instance;
			// debug("created "
			// 	+ instance.type
			// 	+ " File instance "
			// 	+ strong(path.relative(process.cwd(), instance.filepath)), 3);
		} else {
			// Unable to resolve id
			return fn(strong(filepath) + ' not found in project sources');
		}
	}
	return fn(null, instance);
};

/**
 * Constructor
 * @param {String} id
 * @param {String} filepath
 */
function File(id, filepath) {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.fileExtensions = null;
*/
	this.id = id;
	this.filepath = filepath;
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.dependencies = null;
	this.isDependency = false;
}

/**
 * Read and store file contents
 * @param {Function} fn
 */
File.prototype.read = function(fn) {
	if (!this.content && !this.originalContent) {
		return read(this, fn);
	} else {
		return fn(null, this);
	}
}

/**
 * Compile file contents
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.compile = function(options, fn) {
	return transfigure(this, clone(options), fn);
}

/**
 * Parse file contents for dependency references
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.parse = function(options, fn) {
	var self = this
		, opts = {
			type: this.type,
			sources: this.sources,
			fileExtensions: this.fileExtensions
		};
	if (!this.dependencies) {
		// Parse dependencies
		parse(this, clone(options), function(err, file) {
			// Get dependency filepaths and store
			self.dependencies = self.dependencies.map(function(dependency) {
				var filepath = identify(self.filepath, dependency, opts);
				// WARN dependency not found
				return {id: dependency, filepath: filepath, instance: null};
			// Remove not found
			}).filter(function(dependency) {
				return !!dependency.filepath;
			});
			return fn(null, file);
		});
	} else {
		return fn(null, this);
	}
}

/**
 * Escape file contents for lazy js modules
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.escape = function(options, fn) {
	return escape(this, clone(options), fn);
}

/**
 * Compress file contents
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.compress = function(options, fn) {
	return compress(this, clone(options), fn);
}

/**
 * Wrap file contents in a module definition
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.wrap = function(options, fn) {
	return wrap(this, clone(options), fn);
}

/**
 * Concatenate file contents
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.concat = function(options, fn) {
	// Store instance references
	// Assume that instances already exist
	this.dependencies.forEach(function(dependency) {
		dependency.instance = cache[dependency.filepath];
	});
	return concat(this, clone(options), fn);
}

/**
 * Write file contents to disk
 * @param {Object} options
 * @param {Function} fn
 */
File.prototype.write = function(options, fn) {
	write(this, clone(options), function(err, file, filepath) {
		if (err) return fn(err);
		fn(null, filepath);
	});
}

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function(hard) {
	this.isDependency = false;
	this.dependencies = null;
	this.content = '';
	if (hard) this.originalContent = '';
};

/**
 * Destroy instance
 */
File.prototype.destroy = function() {
	this.reset(true);
	this.type = this.sources = this.fileExtensions = null;
	this.id = this.filepath = this.name = this.extension = '';
	delete cache[this.filepath];
};
