var Promise = require('bluebird')
	, path = require('path')
	, fs = require('fs')
	, readFile = Promise.promisify(fs.readFile)
	, exists = fs.existsSync
	, EventEmitter = require('events').EventEmitter
	, inherit = require('util').inherits
	, FileCache = require('./FileCache')
	, identify = require('identify-resource').identify
	, resolve = require('identify-resource').resolve
	, lodash = require('lodash')
	, merge = lodash.merge
	, clone = lodash.clone
	, flatten = lodash.flatten
	, cnsl = require('../utils/cnsl')
	, warn = cnsl.warn
	, debug = cnsl.debug
	, colour = cnsl.colour
	, print = cnsl.print
	, strong = cnsl.strong
	, write = require('./helpers/write')
	, commands = {
			compile: require('transfigure'),
			compress: require('./helpers/compress'),
			concat: require('./helpers/concat'),
			inline: require('./helpers/inline'),
			lint: require('./helpers/lint'),
			escape: require('./helpers/escape'),
			parse: require('./helpers/parse'),
			replace: require('./helpers/replace'),
			wrap: require('./helpers/wrap')
		}

	, BOILERPLATE = fs.readFileSync(path.resolve(__filename, '../../../node_modules/simple-browser-require/require.js'), 'utf8');

/**
 * File instance factory
 * @param {String} filepath
 * @param {Object} options
 * @returns {File}
 */
var factory = module.exports = function (filepath, options) {
	var file, id;

	if (factory.cache.hasFile(filepath)) {
		file = factory.cache.getFile(filepath);
	} else {
		// Create new file if valid id
		if (id = identify(filepath, options)) {
			file = new File(id, filepath, options);
			factory.cache.addFile(filepath, file);
		}
	}

	return file;
};

/*
 * Default file cache
 */
module.exports.cache = new FileCache();

/**
 * Constructor
 * @param {String} id
 * @param {String} filepath
 * @param {Object} options
 */
function File (id, filepath, options) {
	this.options = options;
	this.type = options.type;
	this.id = id;
	this.filepath = filepath;
	this.outputPath = '';
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.compiledContent = '';
	this.dependencies = [];
	this.dependencyReferences = [];
	this.dependant = null;
	this.workflow = null;

	EventEmitter.call(this);

	debug("created "
		+ this.type
		+ " File instance "
		+ strong(path.relative(process.cwd(), this.filepath)), 3);
}

// Inherit
inherit(File, EventEmitter);

/**
 * Run 'workflow' tasks in sequence
 * @param {Array} workflow
 * @returns {Promise}
 */
File.prototype.run = function (workflow) {
	if (workflow && !this.workflow) {
		var self = this;

		// Store
		this.workflow = workflow;

		// Execute tasks in sequence
		return workflow.reduce(function (sequence, task) {
			return sequence.then(function () {
				return self[task]();
			});
		}, Promise.resolve());

	// Running or already run
	} else {
		return Promise.resolve();
	}
};

/**
 * Read and store file contents
 * @returns {Promise}
 */
File.prototype.load = function () {
	var self = this;

	return readFile(this.filepath, 'utf8')
		.then(function (content) {
			self.content = self.originalContent = content;
		});
};

/**
 * Compile file contents
 * @returns {Promise}
 */
File.prototype.compile = function () {
	// Only compile if not already compiled
	if (!this.compiledContent) {
		var self = this
			, options = {}
			, dataUrl;

		// Expose properties for compilers
		options.id = this.id;
		options.type = this.type;
		if (this.type == 'html') {
			// TODO: flatten dependencies

			// Resolve all nested includes
			// var includes = []
			// 	, resolveIncludes = function (file) {
			// 			file.dependencies.forEach(function (dependency) {
			// 				if (dependency = options.fileCache.getFile(dependency.filepath)) {
			// 					// Recursive
			// 					resolveIncludes(dependency);
			// 					// Store if not already
			// 					if (!~includes.indexOf(dependency)) includes.push(dependency);
			// 				}
			// 			});
			// 		};
			// resolveIncludes(this);
			// options.includes = includes;

			// Check/load data json file of same name in same directory
			if (fs.existsSync((dataUrl = path.resolve(path.dirname(this.filepath), this.name.replace(this.extension, 'json'))))) {
				options.data = require(dataUrl);
			}
		}
		// TODO: add 'paths' for css (see transfigure/stylus)

		return commands['compile'](this.filepath, this.content, merge(clone(this.options), options))
			.then(function (content) {
				// Store
				self.content = self.compiledContent = content;

				debug('compile: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
			});
	} else {
		return Promise.resolve();
	}
};

/**
 * Parse file contents for dependency references
 * @returns {Promise}
 */
File.prototype.parse = function () {
	var self = this;

	// Parse dependencies
	return commands['parse'](this.filepath, this.type, this.content)
		.then(function (dependencies) {
			return Promise.all(dependencies.map(function (dependency) {
				// Save context for inlining
				self.dependencyReferences.push(dependency);
				if (filepath = resolve(self.filepath, dependency.filepath, self.options)) {
					dependency.instance = factory(filepath, self.options);
					// Store if not already stored
					if (!~self.dependencies.indexOf(dependency.instance)
						// ...and if not circular dependency
						&& dependency.instance !== self.dependant) {
							dependency.instance.dependant = self;
							self.dependencies.push(dependency.instance);
					}
					// Run if not already running
					return dependency.instance.workflow
						? Promise.resolve()
						: dependency.instance.run(self.workflow);

				// Unable to resolve filepath
				} else {
					warn("dependency "
						+ (strong(dependency.filepath))
						+ " for "
						+ (strong(self.id))
						+ " not found (ids are case-sensitive)", 4);
					return Promise.resolve();
				}
			}))

			debug('parse: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Inline dependency content
 * @returns {Promise}
 */
File.prototype.inline = function () {
	var self = this;

	return commands['inline'](this.filepath, this.type, this.content, this.dependencyReferences)
		.then(function (content) {
			self.content = content;
			debug('inline: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Replace relative dependency references with fully resolved
 * @returns {Promise}
 */
File.prototype.replace = function () {
	var self = this;

	return commands['replace'](this.content, this.dependencyReferences)
		.then(function (content) {
			self.content = content;
			debug('replace: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Lint file contents
 * @returns {Promise}
 */
File.prototype.lint = function () {
	// Don't lint compiled files
	if (this.extension == this.type) {
		var self = this;

		return commands['lint'](this.type, this.content)
			.then(function (warnings) {
				if (warnings) {
					warn('failed linting', 3);
					warnings.forEach(function (item) {
						if (item) {
							print("["
								+ (colour(item.line, cnsl.CYAN))
								+ ":"
								+ (colour(item.col, cnsl.CYAN))
								+ "] "
								+ item.reason
								+ ":", 4);
							if (item.evidence) print("" + (strong(item.evidence)), 5);
						}
					});
				} else {
					debug('lint: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
				}
				return warnings;
			});
	} else {
		return Promise.resolve();
	}
};

/**
 * Escape file contents for lazy js modules
 * @returns {Promise}
 */
File.prototype.escape = function () {
	var self = this;

	return commands['escape'](this.content)
		.then(function (content) {
			self.content = content;
			debug('escape: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Compress file contents
 * @returns {Promise}
 */
File.prototype.compress = function () {
	var self = this;

	return commands['compress'](this.type, this.content)
		.then(function (content) {
			self.content = content;
			print(""
				+ colour('compressed', cnsl.GREEN)
				+ " "
				+ strong(path.relative(process.cwd(), self.filepath)), 3);
		});
};

/**
 * Wrap file contents in a module definition
 * @returns {Promise}
 */
File.prototype.wrap = function () {
	var self = this;

	return commands['wrap'](this.id, this.content, this.options.runtimeOptions.lazy)
		.then(function (content) {
			self.content = content;
			debug('wrap: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Concatenate file contents
 * @returns {Promise}
 */
File.prototype.concat = function () {
	var self = this;

	return commands['concat'](this)
		.then(function (content) {
			// // Warn on json inlining errors
			// results.errors.forEach(function(errorpath) {
			// 	warn("failed inlining json " + (strong(errorpath)), 4);
			// });
			self.content = content;
			debug('concat: ' + strong(path.relative(process.cwd(), self.filepath)), 4);
		});
};

/**
 * Write file contents to disk
 * @returns {Promise}
 */
File.prototype.write = function () {
	var self = this;

	// Add require boilerplate
	if (options.boilerplate) {
		this.content = BOILERPLATE
			+ '\n'
			+ this.content;
	}

	// Add bootstrap call
	if (options.bootstrap) {
		this.content += '\nrequire(\'' + this.id + '\');'
	}

	return write(this.outputPath, this.content)
		.then(function () {
			print(colour('built', cnsl.GREEN)
				+ " "
				+ strong(path.relative(process.cwd(), self.outputPath)), 3);
		});
};

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function (hard) {
	this.workflow = null;
	this.dependant = null;
	this.dependencies = [];
	this.dependencyReferences = [];
	this.outputPath = '';
	if (this.type != 'js') {
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
File.prototype.destroy = function () {
	this.reset(true);
	this.options = null;
};