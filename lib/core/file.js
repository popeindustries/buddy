var path = require('path')
	, async = require('async')
	, transfigure = require('transfigure')
	, identify = require('identify-resource')
	, lodash = require('lodash')
	, extend = lodash.extend
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

var RE_BUILT_HEADER = /^\/\*BUILT/g;

/**
 *
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
			debug("created "
				+ instance.type
				+ " File instance "
				+ strong(path.relative(process.cwd(), instance.filepath)), 3);
		} else {
			// Unable to resolve id
			return fn(strong(filepath) + ' not found in project sources');
		}
	}
};

/**
 * Constructor
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
	this.main = false;
}

File.prototype.read = function(fn) {
	if (!this.content && !this.originalContent) {
		return read(this, fn);
	} else {
		return fn(null, this);
	}
}

File.prototype.transfigure = function(options, fn) {
	return transfigure(this, options, fn);
}

File.prototype.parse = function(options, fn) {
	if (!this.dependencies) {
		return parse(this, options, fn);
	} else {
		return fn(null, this);
	}
}

File.prototype.escape = function(options, fn) {
	return escape(this, options, fn);
}

File.prototype.compress = function(options, fn) {
	return compress(this, options, fn);
}

File.prototype.wrap = function(options, fn) {
	return wrap(this, options, fn);
}

File.prototype.concat = function(options, fn) {
	return concat(this, options, fn);
}

File.prototype.write = function(options, fn) {
	return write(this, options, fn);
}

File.prototype.reset = function() {
// reuse
};

File.prototype.destroy = function() {
	this.sources = this.fileFilter = this.fileExtensions = this.dependencies = null;
	delete cache[this.filepath];
};

File.prototype.resolve = function(fn) {
	var options = {
				type: this.type,
				sources: this.sources,
				fileExtensions: this.fileExtensions}
		, depedencyFilepath, n;
	// Loop through and store instances
	if (n = this.dependencies.length) {
		this.dependencies.forEach(function(dependencyID, idx) {
			// Get filepath
			depedencyFilepath = identify(this.filepath, dependencyID, options);
			if (depedencyFilepath) {
				// Get instance
				factory(depedencyFilepath, options, function(err, instance) {
					if (err) return warn(err, 4);
					// Store with original id
					this.dependencies[idx] = {id: dependencyID, instance: instance};
					if (idx == n - 1) return fn();
				}.bind(this));
			} else {
				warn("dependency "
					+ (strong(dependency))
					+ " for "
					+ (strong(this.id))
					+ " not found", 4);
				if (idx == n - 1) return fn();
			}
		}.bind(this));
	} else {
		fn();
	}
};
