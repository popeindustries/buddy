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
		// Create new file if valid (exists, has id)
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
	this.relpath = path.relative(process.cwd(), filepath);
	this.outputPath = '';
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.compiledContent = '';
	this.dependencies = [];
	this.dependencyReferences = [];
	this.dependants = [];
	this.workflow = null;
	this.isWriteable = true;

	EventEmitter.call(this);

	debug("created "
		+ this.type
		+ " File instance "
		+ strong(this.relpath), 3);
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
			// Chain
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
			debug('load: ' + strong(self.relpath), 4);
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
			// Gather all dependencies
			options.includes = flatten(this.dependencies, 'dependencies');
			// Check/load data json file of same name in same directory
			if (fs.existsSync((dataUrl = path.resolve(path.dirname(this.filepath), this.name.replace(this.extension, 'json'))))) {
				options.data = require(dataUrl);
			}
		} else if (this.type == 'css') {
			// Store all directories
			// TODO: filter css only?
			options.paths = factory.cache.getDirs();
		}

		return commands['compile'](this.filepath, this.content, options)
			.then(function (content) {
				debug('compile: ' + strong(self.relpath), 4);

				// Store
				self.content = self.compiledContent = content;
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
			debug('parse: ' + strong(self.relpath), 4);

			// Run all dependencies in sequence
			return dependencies.reduce(function (sequence, dependency) {
				// Chain
				return sequence.then(function () {
					// Save context for future inlining
					self.dependencyReferences.push(dependency);

					// Validate and add
					if (filepath = resolve(self.filepath, dependency.filepath, self.options)) {
						// Get instance
						dependency.instance = factory(filepath, self.options);
						// Set isWriteable flag (js files are set during concat)
						if (self.type != 'js') dependency.instance.isWriteable = false;
						// Store if not already stored
						if (!~self.dependencies.indexOf(dependency.instance)
							// ...and if not circular dependency
							&& !~self.dependants.indexOf(dependency.instance)) {
								dependency.instance.dependants.push(self);
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
				});
			}, Promise.resolve());
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
			debug('inline: ' + strong(self.relpath), 4);
			self.content = content;
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
			debug('replace: ' + strong(self.relpath), 4);
			self.content = content;
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
					debug('lint: ' + strong(self.relpath), 4);
				}
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
			debug('escape: ' + strong(self.relpath), 4);
			self.content = content;
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
			print(""
				+ colour('compressed', cnsl.GREEN)
				+ " "
				+ strong(self.relpath), 3);
			self.content = content;
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
			debug('wrap: ' + strong(self.relpath), 4);
			self.content = content;
		});
};

/**
 * Concatenate file contents
 * @returns {Promise}
 */
File.prototype.concat = function () {
	var self = this;

	return commands['concat'](this.type, this.content, this.dependencies)
		.then(function (content) {
			debug('concat: ' + strong(self.relpath), 4);
			self.content = content;
		});
};

/**
 * Write file contents to disk
 * @param {String} filepath
 * @param {Object} options
 * @returns {Promise}
 */
File.prototype.write = function (filepath, options) {
	var self = this;

	options = options || {};

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
	return new Promise(function (resolve, reject) {
		// setTimeout(resolve, 200);
	})
	// return write(filepath, this.content)
		// .then(function (filepath) {
		// 	console.log('hey', filepath)
		// 	print(colour('built', cnsl.GREEN)
		// 		+ " "
		// 		+ strong(path.relative(process.cwd(), filepath)), 3);
		// })/*.return(filepath)*/;
};

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function (hard) {
	// TODO: reset dependencies
	this.workflow = null;
	this.dependants = [];
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