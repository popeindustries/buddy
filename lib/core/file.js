var path = require('path')
	, fs = require('fs')
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, async = require('async')
	, identify = require('identify-resource').identify
	, resolve = require('identify-resource').resolve
	, lodash = require('lodash')
	, extend = lodash.extend
	, clone = lodash.clone
	, term = require('buddy-term')
	, warn = term.warn
	, debug = term.debug
	, colour = term.colour
	, print = term.print
	, strong = term.strong
	, write = require('./file/write')
	, commands = {
			compile: require('transfigure'),
			compress: require('./file/compress'),
			concat: require('./file/concat'),
			lint: require('./file/lint'),
			escape: require('./file/escape'),
			parse: require('./file/parse'),
			replace: require('./file/replace'),
			wrap: require('./file/wrap')
		};

/**
 * File instance factory
 * @param {String} filepath
 * @param {Object} options
 * @param {Function} fn(err, instance)
 */
module.exports = function(filepath, options) {
	var id, instance;
	// Create new instance
	if (id = identify(filepath, options)) {
		instance = new File(id, filepath, options);
		instance.readSync();
		return instance;
		// return fn(null, instance);
	} else {
		// Unable to resolve id
		return null;
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
	this.outputPath = '';
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.compiledContent = '';
	this.dependencies = [];
	this.isDependency = false;
	this.process = [];

	EventEmitter.call(this);

	debug("created "
		+ this.type
		+ " File instance "
		+ strong(path.relative(process.cwd(), this.filepath)), 3);
}

// Inherit
inherit(File, EventEmitter);

/**
 * Read and store file contents
 */
File.prototype.readSync = function() {
	this.content = this.originalContent = fs.readFileSync(this.filepath, 'utf8');
};

/**
 * Read and store file contents
 */
File.prototype.read = function(fn) {
	var self = this;
	fs.readFile(this.filepath, 'utf8', function(err, content) {
		if (err) fn(err);
		self.content = self.originalContent = content;
		fn();
	});
};

/**
 * Compile file contents
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.compile = function(options, fn) {
	if (!this.compiledContent) {
		var self = this;
		commands['compile'](this.filepath, this.content, extend(clone(this.runtimeOptions), clone(options)), function(err, content) {
			if (err) return fn(err);
			// Store
			self.content = self.compiledContent = content;
			self.process.push('compile');
			debug('compile: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
			return fn(null, self);
		});
	} else {
		return fn(null, this);
	}
};

/**
 * Parse file contents for dependency references
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.parse = function(options, fn) {
	var self = this
		, opts;
	if (!~this.process.indexOf('parse')) {
		opts = {
			type: this.type,
			sources: this.sources,
			fileExtensions: this.fileExtensions
		};
		// Parse dependencies
		commands['parse'](this, extend(clone(this.runtimeOptions), clone(options)), function(err, file) {
			// Get dependency filepaths and store
			self.dependencies = self.dependencies.map(function(dependency) {
				var filepath = resolve(self.filepath, dependency, opts);
				// Get fully resolved id
				var id = identify(filepath, opts);
				if (!filepath || !id) {
					warn("dependency "
						+ (strong(dependency))
						+ " for "
						+ (strong(file.id))
						+ " not found (ids are case-sensitive)", 4);
				}
				return {id: dependency, idFull: id, filepath: filepath};
			// Remove not found
			}).filter(function(dependency) {
				return !!dependency.filepath;
			});
			self.process.push('parse');
			debug('parse: ' + strong(path.relative(process.cwd(), file.filepath)), 4);
			return fn(null, file);
		});
	} else {
		return fn(null, this);
	}
};

/**
 * Escape file contents for lazy js modules
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.replace = function(options, fn) {
	this._command('replace', options, fn);
};

/**
 * Lint file contents
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.lint = function(options, fn) {
	// Don't lint compiled files
	if (!~this.process.indexOf('lint') && this.type == this.extension) {
		commands['lint'](this, extend(clone(this.runtimeOptions), clone(options)), function(err, file) {
			if (err) {
				warn('failed linting', 3);
				err.items.forEach(function(item) {
					if (item) {
						print("["
							+ (colour(item.line, term.CYAN))
							+ ":"
							+ (colour(item.col, term.CYAN))
							+ "] "
							+ item.reason
							+ ":", 4);
						if (item.evidence) print("" + (strong(item.evidence)), 5);
					}
				});
			} else {
				debug('lint: ' + strong(path.relative(process.cwd(), file.filepath)), 4);
			}
			file.process.push('lint');
			return fn(err, file);
		});
	} else {
		return fn(null, this);
	}
};

/**
 * Escape file contents for lazy js modules
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.escape = function(options, fn) {
	this._command('escape', options, fn);
};

/**
 * Compress file contents
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.compress = function(options, fn) {
	this._command('compress', options, function(err, file) {
		if (err) return fn(err);
		print(""
			+ colour('compressed', term.GREEN)
			+ " "
			+ strong(path.relative(process.cwd(), file.filepath)), 3);
		return fn(null, file);
	});
};

/**
 * Wrap file contents in a module definition
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.wrap = function(options, fn) {
	this._command('wrap', options, fn);
};

/**
 * Concatenate file contents
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype.concat = function(options, fn) {
	this._command('concat', options, fn);
};

/**
 * Write file contents to disk
 * @param {Function} fn(err, filepath)
 */
File.prototype.write = function(fn) {
	var self = this;
	write(this, this.outputPath, function(err, file) {
		if (err) return fn(err);
		print(colour('built', term.GREEN)
			+ " "
			+ strong(path.relative(process.cwd(), self.outputPath)), 3);
		fn();
	});
};

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function(hard) {
	this.isDependency = false;
	this.dependencies = [];
	this.process = [];
	this.outputPath = '';
	if (this.type == 'css') {
		this.content = this.originalContent;
		this.compiledContent = '';
	} else {
		this.content = this.compiledContent || this.originalContent;
	}
	if (hard) {
		this.content = this.originalContent = this.compiledContent = '';
	}
};

/**
 * Destroy instance
 */
File.prototype.destroy = function() {
	this.reset(true);
	this.sources = this.fileExtensions = this.runtimeOptions = null;
};

/**
 * Execute 'command'
 * @param {String} command
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
File.prototype._command = function(command, options, fn) {
	if (!~this.process.indexOf(command)) {
		commands[command](this, extend(clone(this.runtimeOptions), clone(options)), function(err, file) {
			if (err) return fn(err);
			file.process.push(command);
			debug(command + ': ' + strong(path.relative(process.cwd(), file.filepath)), 4);
			fn(null, file);
		});
	} else {
		return fn(null, this);
	}
};
