var fs = require('fs')
	, path = require('path')
	, async = require('async')
	, bind = require('../utils/object').bind
	, notify = require('../utils/notify')
	, debug = notify.debug
	, strong = notify.strong
	, colour = notify.colour
	, print = notify.print
	, warn = notify.warn
	, _fs = require('../utils/fs')
	, indir = _fs.indir
	, readdir = _fs.readdir
	, mkdir = _fs.mkdir
	, existsSync = _fs.existsSync
	, ignored = _fs.ignored;

var BUILT_HEADER = '/*BUILT ';

/**
 * Target instance factory
 * @param {String} type
 * @param {Object} options
 * @param {Function} fn(err, instance)
 */
module.exports = function(type, options, fn) {
	var inputpath = path.resolve(options.input)
		, outputpath = path.resolve(options.output);
	// Validate target
	// Abort if input doesn't exist
	if (!existsSync(inputpath)) {
		return fn(""
			+ (strong(options.input))
			+ " doesn\'t exist");
	}
	fs.stat(inputpath, function(err, stats) {
		if (err) return fn(err);
		var isDir = stats.isDirectory()
			, valid;
		// Check that input exists in sources
		for (var i = 0, n = options.source.locations.length; i < n; ++i) {
			valid = indir(options.source.locations[i], inputpath);
			if (valid) break;
		}
		if (!valid) {
			// Add if input file doesn't exist in sources
			if (!isDir) {
				debug("input doesn't exist in sources. Adding: " + strong(options.input), 2);
				if (!options.source.add(inputpath)) {
					return fn(""
						+ (strong(options.input))
						+ " not found in project path");
				}
			// Abort if input directory not in sources
			} else {
					return fn(""
						+ (strong(options.input))
						+ " not found in sources");
			}
		}
		// Abort if input is directory and output is file
		if (isDir && path.extname(outputpath).length) {
			return fn("a file ("
				+ (strong(options.output))
				+ ") is not a valid output target for a directory ("
				+ (strong(options.input))
				+ ") input target");
		}
		// Override options
		if (options.modular == null) options.modular = true;
		// A single file can be 'batched' if not modular
		// Resolve dependencies even if directory for css
		options.concat = isDir
			? type == 'css'
			: options.modular;
		if (options.compress) options.compressor = options.processors.compressor;
		if (options.lint) options.linter = options.processors.linter;
		return fn(null, new Target(type, isDir, options));
	});
};

/**
 * Constructor
 * @param {String} type
 * @param {Boolean} isDir
 * @param {Object} options
 */
function Target(type, isDir, options) {
	this._write = bind(this._write, this);
	this._compress = bind(this._compress, this);
	this._lint = bind(this._lint, this);
	this._compile = bind(this._compile, this);
	this._outputFile = bind(this._outputFile, this);
	this._parse = bind(this._parse, this);
	this.type = type;
	this.isDir = isDir;
	this.options = options;
	this.input = path.resolve(this.options.input);
	this.output = path.resolve(this.options.output);
	this.output_compressed = this.options.output_compressed ? path.resolve(this.options.output_compressed) : this.output;
	this.sources = [];
	this.files = [];
	// Track all modified files so we can reset when complete
	this._modified = [];
	// Resolve default output file name for file>directory target
	if (!this.isDir && !path.extname(this.output).length) {
		this.output = path.join(this.output, path.basename(this.input)).replace(path.extname(this.input), "." + this.type);
	}
	debug("created "
		+ this.type
		+ " Target instance with input: "
		+ (strong(this.options.input))
		+ " and output: "
		+ (strong(this.options.output)), 2);
}

/**
 * Generate output, 'compress'ing and 'lint'ing as required
 * @param {Function} fn(err, files)
 */
Target.prototype.build = function(fn) {
	var self = this;
	this.sources = [];
	this.files = [];
	if (!this.options.source.options.watching) {
		print("building "
			+ (strong(path.basename(this.input)))
			+ " to "
			+ (strong(path.basename(this.output))), 2);
	}
	// Parse sources for input
	this._parse(function(err) {
		if (err) return fn(err);
		if (self.sources.length) {
			async.forEach(self.sources, self._outputFile, function(err) {
				if (err) return fn(err, self.files);
				fn(null, self.files);
			});
		} else {
			warn("no sources to build in " + (strong(self.input)), 3);
			fn(null, self.files);
		}
	});
};

/**
 * Determine if a File exists in sources or a parent's
 * @param {File} file
 * @return	{Boolean}
 */
Target.prototype.hasSource = function(file) {
	return this.sources.indexOf(file) != -1
		|| this.options.hasParent && this.options.parent.hasSource(file);
};

/**
 * Reset modified files
 */
Target.prototype.reset = function() {
	this._modified.map(function(file) {
		file.reset();
	});
	this._modified = [];
	if (this.options.hasParent) {
		this.options.parent.reset();
	}
};

/**
 * Parse input sources
 * Resolve number of source files with dependencies
 * @param {Function} fn(err)
 */
Target.prototype._parse = function(fn) {
	var outstanding = 0
		, self = this
		, file;
	// Inner function
	var parse = function(file, dependant, fn) {
		var dep;
		// Parse file content, if necessary
		outstanding++;
		file.parseContent(function(err) {
			// Exit if compile error
			if (err) return fn(err);
			// Add dependencies
			if (self.options.concat && file.dependencies.length) {
				file.dependencies.forEach(function(dependency, idx) {
					dep = self.options.source.byModule[dependency]
							|| self.options.source.byModule["" + dependency + "/index"];
					// Resolve dependency
					if (dep) {
						// Protect against circular references
						// but allow duplicate css dependencies
						if (dep != dependant && (self.type == 'css' ? true : !dep.isDependency)) {
							// Store dependency references
							dep.isDependency = true;
							if (!self._modified.indexOf(dep) == -1) self._modified.push(dep);
							// Replace string ref with instance
							file.dependencies[idx] = dep;
							debug("added dependency "
								+ (strong(dep.moduleID))
								+ " to "
								+ (strong(file.moduleID)), 3);
							// Parse
							parse(dep, file, fn);
						}
					// Don't warn if dependency is already resolved
					} else if ('String' == typeof dependency) {
						warn("dependency "
							+ (strong(dependency))
							+ " for "
							+ (strong(file.moduleID))
							+ " not found", 4);
					}
				});
			}
			outstanding--;
			// Return when finished
			if (!outstanding) {
				fn();
			}
		});
	};

	// Input is directory
	if (this.isDir) {
		// Grab files
		readdir(this.input, ignored, function(err, files) {
			// Find files in source cache
			files.forEach(function(filepath) {
				file = self.options.source.byPath[filepath];
				if (file) {
					// Add unless already added
					if (!self.hasSource(file)) {
						self.sources.push(file);
						self._modified.push(file);
						parse(file, null, function(err) {
							if (err) return fn(err);
							// Filter out all files that are dependants
							self.sources = self.sources.filter(function(file) {
								return !file.isDependency;
							});
							// Return when finished
							if (!outstanding) {
								return fn();
							}
						});
					// Return when finished
					} else {
						if (!outstanding) {
							return fn();
						}
					}
				}
			});
		});

	// Input is file
	} else {
		file = this.options.source.byPath[this.input];
		if (file) {
			// Add unless already added
			if (!this.hasSource(file)) {
				this.sources.push(file);
				this._modified.push(file);
				parse(file, null, fn);
			} else {
				return fn();
			}
		}
	}
};

/**
 * Output file sequence
 * @param {File} file
 * @param {Function} fn(err)
 */
Target.prototype._outputFile = function(file, fn) {
	var self = this
		, content, filepath;
	// Concatenate
	if (this.options.concat) {
		content = file.options.module.concat(file);
		debug("concatenated: " + (strong(path.relative(process.cwd(), file.filepath))), 3);
	// Optionally wrap content
	} else {
		content = file.getContent(this.options.modular);
	}
	// Specify filepath based on compression option
	filepath = this.options.compress ? this.output_compressed : this.output;
	// Resolve output path if directory
	if (!path.extname(filepath).length) filepath = path.join(filepath, file.qualifiedName) + '.' + this.type;
	// Sequence
	async.waterfall([
		(function(cb) {
			self._compile(content, filepath, file.options.compiler, cb);
		}),
		this._lint,
		this._compress,
		this._write
	], function(err) {
		if (err) return fn(err);
		fn();
	});
};

/**
 * Compile contents, if necessary
 * @param {String} content
 * @param {String} filepath
 * @param {Object} compiler
 * @param {Function} fn(err, content, filepath)
 */
Target.prototype._compile = function(content, filepath, compiler, fn) {
	if (this.options.compile && compiler) {
		compiler.compile(content, function(err, content) {
			if (err) return fn(err);
			debug("compiled: " + (strong(path.relative(process.cwd(), filepath))), 3);
			fn(null, content, filepath);
		});
	} else {
		fn(null, content, filepath);
	}
};

/**
 * Lint contents, if necessary
 * @param {String} content
 * @param {String} filepath
 * @param {Function} fn(err, content, filepath)
 */
Target.prototype._lint = function(content, filepath, fn) {
	if (this.options.lint) {
		this.options.linter.lint(content, function(err) {
			if (err) {
				warn('failed linting', 3);
				err.items.forEach(function(item) {
					if (item) {
						print("["
							+ (colour(item.line, notify.CYAN))
							+ ":"
							+ (colour(item.col, notify.CYAN))
							+ "] "
							+ item.reason
							+ ":", 4);
						if (item.evidence) print("" + (strong(item.evidence)), 5);
					}
				});
			} else {
				print(""
					+ (colour('linted', GREEN))
					+ " "
					+ (strong(path.relative(process.cwd(), filepath))), 3);
			}
			fn(null, content, filepath);
		});
	} else {
		fn(null, content, filepath);
	}
};

/**
 * Compress contents, if necessary
 * @param {String} content
 * @param {String} filepath
 * @param {Function} fn(err, content, filepath)
 */
Target.prototype._compress = function(content, filepath, fn) {
	if (this.options.compress) {
		this.options.compressor.compress(content, function(err, content) {
			if (err) return fn(err);
			print(""
				+ (colour('compressed', notify.GREEN))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), 3);
			fn(null, content, filepath);
		});
	} else {
		fn(null, content, filepath);
	}
};

/**
 * Write contents to disk
 * @param {String} content
 * @param {String} filepath
 * @param {Function} fn(err)
 */
Target.prototype._write = function(content, filepath, fn) {
	var self = this;
	mkdir(filepath, function(err) {
		if (err) return fn(err);
		// Add header for concatenated files
		if (self.options.concat) {
			content = ""
				+ BUILT_HEADER
				+ (new Date().toString())
				+ "*/\n"
				+ content;
		}
		fs.writeFile(filepath, content, 'utf8', function(err) {
			if (err) return fn(err);
			self.files.push(filepath);
			print(""
				+ (colour('built', notify.GREEN))
				+ " "
				+ (strong(path.relative(process.cwd(), filepath))), self.options.source.options.watching
					? 4
					: 3);
			fn();
		});
	});
};
