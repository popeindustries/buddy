// TODO: lint, built header

var path = require('path')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, async = require('async')
	, transfigure = require('transfigure')
	, identify = require('identify-resource')
	, Watcher = require('yaw')
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
	, watcher = new Watcher();

// Handle watch events
watcher.on('change', function(filepath, stats) {

});

watcher.on('delete', function(filepath) {

});

watcher.on('error', function(err) {

});

/**
 * File instance factory
 * @param {String} filepath
 * @param {Object} options
 * @param {Function} fn(err, instance)
 */
module.exports = function(filepath, options, fn) {
	var id, instance;
	// Create new instance
	if (id = identify(filepath, options)) {
		instance = new File(id, filepath, options);
		// debug("created "
		// 	+ instance.type
		// 	+ " File instance "
		// 	+ strong(path.relative(process.cwd(), instance.filepath)), 3);
		return fn(null, instance);
	} else {
		// Unable to resolve id
		return fn(strong(filepath) + ' not found in project sources');
	}
};

/**
 * Constructor
 * @param {String} id
 * @param {String} filepath
 * @param {Object} options
 */
function File(id, filepath, options) {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.fileExtensions = null;
	this.runtimeOptions = null;
*/
	extend(this, options);
	this.id = id;
	this.filepath = filepath;
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.compiledContent = '';
	this.originalContent = '';
	this.dependencies = null;
	this.isDependency = false;

	EventEmitter.call(this);
}

// Inherit
inherit(File, EventEmitter);

/**
 * Read and store file contents
 * @param {Function} fn(err)
 */
File.prototype.read = function(fn) {
	if (!this.originalContent) {
		return read(this, fn);
	} else {
		this.content = this.originalContent;
		return fn(null, this);
	}
}

/**
 * Compile file contents
 * @param {Object} options
 * @param {Function} fn(err)
 */
File.prototype.compile = function(options, fn) {
	if (!this.compiledContent) {
		return transfigure(this, extend(clone(this.runtimeOptions), clone(options)), function(err, file) {
			if (err) return fn(err);
			file.compiledContent = file.content;
			fn(null, file);
		});
	} else {
		this.content = this.compiledContent;
		return fn(null, this);
	}
}

/**
 * Parse file contents for dependency references
 * @param {Object} options
 * @param {Function} fn(err, file)
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
		parse(this, extend(clone(this.runtimeOptions), clone(options)), function(err, file) {
			// Get dependency filepaths and store
			self.dependencies = self.dependencies.map(function(dependency) {
				var filepath = identify(self.filepath, dependency, opts);
				// WARN dependency not found
				return {id: dependency, filepath: filepath};
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
 * @param {Function} fn(err)
 */
File.prototype.escape = function(options, fn) {
	return escape(this, extend(clone(this.runtimeOptions), clone(options)), fn);
}

/**
 * Compress file contents
 * @param {Object} options
 * @param {Function} fn(err)
 */
File.prototype.compress = function(options, fn) {
	return compress(this, extend(clone(this.runtimeOptions), clone(options)), fn);
}

/**
 * Wrap file contents in a module definition
 * @param {Object} options
 * @param {Function} fn(err)
 */
File.prototype.wrap = function(options, fn) {
	return wrap(this, extend(clone(this.runtimeOptions), clone(options)), fn);
}

/**
 * Concatenate file contents
 * @param {Object} options
 * @param {Function} fn(err)
 */
File.prototype.concat = function(options, fn) {
	return concat(this, extend(clone(this.runtimeOptions), clone(options)), fn);
}

/**
 * Write file contents to disk
 * @param {Object} options
 * @param {Function} fn(err, filepath)
 */
File.prototype.write = function(options, fn) {
	write(this, extend(clone(this.runtimeOptions), clone(options)), function(err, file, filepath) {
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
	if (hard) {
		this.originalContent = '';
		this.compiledContent = '';
	}
};

/**
 * Destroy instance
 */
File.prototype.destroy = function() {
	this.reset(true);
	this.sources = this.fileExtensions = this.runtimeOptions = null;
};
