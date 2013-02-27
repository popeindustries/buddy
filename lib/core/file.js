var fs = require('fs')
	, path = require('path')
	, async = require('async')
	, bind = require('../utils/object').bind
	, existsSync = require('recur-fs').existsSync
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong;

var RE_BUILT_HEADER = /^\/\*BUILT/g
	, RE_ESCAPE = /\\|\r?\n|"/g
	, ESCAPE_MAP = {
		'\\': '\\\\',
		'\n': '\\n',
		'\r\n': '\\n',
		'"': '\\"'
	};

/**
 * File instance factory
 * @param {String} type
 * @param {String} filepath
 * @param {String} basepath
 * @param {Object} options
 * @param {Function} fn(err, instance)
 */
module.exports = function(type, filepath, basepath, options, fn) {
	var extension = path.extname(filepath).slice(1)
		, compiler, name, valid;
	filepath = path.resolve(filepath);
	// Validate file
	if (!existsSync(filepath)) {
		return fn("" + (strong(filepath)) + " not found in project path");
	}
	if (extension == type) {
		options.compile = false;
		valid = true;
	} else {
		// Loop through compilers
		for (name in options.processors.compilers) {
			compiler = options.processors.compilers[name];
			if (extension == compiler.extension) {
				// Only js/html sources are compiled at the file level
				options.compile = type != 'css';
				options.compiler = compiler;
				valid = true;
				break;
			}
		}
	}
	if (!valid) {
		return fn("invalid file type " + (strong(path.relative(process.cwd(), filepath))));
	} else {
		// Override options
		if (type != 'js') options.lazy = false;
		// Lazy modules need to be compressed at the file level
		options.compress = options.lazy && options.compress;
		options.module = options.processors.module;
		if (options.compress) options.compressor = options.processors.compressor;
		// Return instance
		return fn(null, new File(type, filepath, basepath, options));
	}
};

/**
 * Constructor
 * @param {String} type
 * @param {String} filepath
 * @param {String} basepath
 * @param {Object} options
 */
function File(type, filepath, basepath, options) {
	this._escape = bind(this._escape, this);
	this._compress = bind(this._compress, this);
	this._compile = bind(this._compile, this);
	this.type = type;
	this.filepath = filepath;
	this.basepath = basepath;
	this.options = options;
	this.name = path.basename(this.filepath);
	// qualified name, with path from base source directory
	this.qualifiedName = path.relative(this.basepath, this.filepath).replace(path.extname(this.name), '');
	// Rename index files in source root
	if (this.qualifiedName == 'index') {
		this.qualifiedName = path.basename(path.join(this.filepath, '..')) + path.sep + 'index';
	}
	this.moduleID = this.options.module
		? this.options.module.getModuleID(this.qualifiedName)
		: null;
	this.dependencies = [];
	this.isDependency = false;
	this._content = '';
	debug("created " + this.type + " File instance " + (strong(path.relative(process.cwd(), this.filepath))) + " with moduleID: " + (strong(this.moduleID)), 3);
}

/**
 * Parse the file's content from disk
 * @param {Function} fn(err)
 */
File.prototype.parseContent = function(fn) {
	var self = this;
	if (this._content) {
		// Delay
		process.nextTick(fn);
	} else {
		fs.readFile(this.filepath, 'utf8', function(err, content) {
			if (err) return fn(err);
			// Abort if this is a built file
			if (content.match(RE_BUILT_HEADER)) return fn();
			// Store
			self._content = content;
			// Resolve dependencies
			self.dependencies = self.options.module
				? self.options.module.getModuleDependencies(self._content, self.moduleID)
				: [];
			// Optionally compile, compress, escape
			async.series([self._compile, self._compress, self._escape], fn);
		});
	}
};

/**
 * Retrieve file content, optionally 'wrapped' in module wrapper
 * @param {Boolean} wrapped
 * @return {String}
 */
File.prototype.getContent = function(wrapped) {
	if (wrapped) {
		return this.options.module.wrapModuleContents(this._content, this.moduleID, this.options.lazy);
	} else {
		return this._content;
	}
};

/**
 * Clear stored content
 */
File.prototype.clearContent = function() {
	return this._content = '';
};

/**
 * Reset instance for re-use
 */
File.prototype.reset = function() {
	this.dependencies = this._content && this.options.module
		? this.options.module.getModuleDependencies(this._content, this.moduleID)
		: [];
	this.isDependency = false;
};

/**
 * Destory instance
 */
File.prototype.destroy = function() {
	this.reset();
	this.clearContent();
	this.options = null;
};

/**
 * Compile content
 * @param {Function} fn(err)
 */
File.prototype._compile = function(fn) {
	var self = this;
	if (this.options.compile) {
		this.options.compiler.compile(this._content, function(err, compiled) {
			if (err) return fn(err);
			debug("compiled: " + (strong(path.relative(process.cwd(), self.filepath))), 3);
			self._content = compiled;
			fn();
		});
	} else {
		fn();
	}
};

/**
 * Compress content
 * (Only relevant for lazy js modules)
 * @param {Function} fn(err)
 */
File.prototype._compress = function(fn) {
	var self = this;
	if (this.options.compress) {
		this.options.compressor.compress(this._content, function(err, compressed) {
			if (err) return fn(err);
			debug("compressed: " + (strong(path.relative(process.cwd(), self.filepath))), 3);
			self._content = compressed;
			fn();
		});
	} else {
		fn();
	}
};

/**
 * Escape content and stringify
 * (Only relevant for lazy js modules)
 * @param {Function} fn()
 */
File.prototype._escape = function(fn) {
	if (this.options.lazy) {
		debug("escaped: " + (strong(path.relative(process.cwd(), this.filepath))), 3);
		this._content = '"' + this._content.replace(RE_ESCAPE, function(m) {
			return ESCAPE_MAP[m];
		}) + '"';
	}
	fn();
};
