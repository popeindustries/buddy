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
	, compact = lodash.compact
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
	this.outputPath = '';
	this.relPath = path.relative(process.cwd(), filepath);
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.compiledContent = '';
	this.dependencies = [];
	this.dependencyReferences = [];
	this.dependants = [];
	this.workflow = null;
	this.isLocked = false;
	this.isRunning = false;

	EventEmitter.call(this);

	debug("created "
		+ this.type
		+ " File instance "
		+ strong(this.relPath), 3);
}

// Inherit
inherit(File, EventEmitter);

/**
 * Retrieve writeable state
 * @returns {Boolean}
 */
File.prototype.getIsWriteable = function () {
	return !this.dependants.length;
};

/**
 * Retrieve flattened dependency tree
 * @param {Boolean} unique
 * @returns {Array}
 */
File.prototype.getDependencies = function (unique) {
	var deps = [];

	function add (dependencies, dependant) {
		dependencies.forEach(function (dependency) {
			// Protect against circular references
			if (dependency != dependant) add(dependency.dependencies, dependency);
			// Store
			if (!unique || (unique && !~deps.indexOf(dependency))) deps.push(dependency);
		});
	};

	add(this.dependencies, this);

	// console.log('deps:', this.id, deps.map(function (dep) { return dep.id }))

	return deps;
};

/**
 * Run 'workflow' tasks in sequence
 * @param {Array} workflow
 * @returns {Promise(File)}
 */
File.prototype.run = function (workflow) {
	// console.log('run', this.id, workflow)
	var self = this
		, files = [this];

	if (workflow && !this.isRunning) {
		this.isRunning = true;
		this.workflow = workflow;

		// Execute tasks in sequence
		return Promise.reduce(workflow, function(narg, task) {
			// console.log(task, self.id)
			return self[task]()
				.then(function (dependencies) {
					if (dependencies) files = compact(flatten(files.concat(dependencies)));
				});
		}, null)
			.then(function () {
				// console.log('done running', self.id)
				self.isRunning = false;
				return files;
			});

	// Running or already run
	} else {
		return Promise.resolve(files);
	}
};

/**
 * Read and store file contents
 * @returns {Promise}
 */
File.prototype.load = function () {
	var self = this;

	if (!this.originalContent) {
		return readFile(this.filepath, 'utf8')
			.then(function (content) {
				debug('load: ' + strong(self.relPath), 4);
				self.content = self.originalContent = content;
			});
	} else {
		this.content = this.originalContent;
		return Promise.resolve();
	}
};

/**
 * Compile file contents
 * @returns {Promise}
 */
File.prototype.compile = function () {
	// Only compile if not already and file isn't flagged as a dependency (css & html)
	if (!this.compiledContent && this.getIsWriteable()) {
		var self = this
			, options = {}
			, dataUrl;

		// Expose properties for compilers
		options.id = this.id;
		options.type = this.type;
		if (this.type == 'html') {
			// Gather all dependencies
			options.includes = this.getDependencies(true);
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
				debug('compile: ' + strong(self.relPath), 4);
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
	var self = this
		, filepath, instance;

	// Parse dependencies
	return commands['parse'](this.filepath, this.type, this.content)
		.then(function (dependencies) {
			debug('parse: ' + strong(self.relPath), 4);

			if (dependencies) {
				return Promise.map(dependencies, function (dependency) {
					// Validate and add
					filepath = resolve(self.filepath, dependency.filepath, self.options)
					instance = factory(filepath, self.options);
					if (filepath && instance) {
						// Save context for future inlining
						self.dependencyReferences.push(dependency);
						// Store instance
						dependency.instance = instance;
						// Process if not locked (parent target files are locked)
						if (!instance.isLocked) {
								// Store if not already stored
							if (!~self.dependencies.indexOf(instance)
									// ...and if not circular dependency
									&& !~self.dependants.indexOf(instance)) {
										instance.dependants.push(self);
										self.dependencies.push(instance);
							}
							return instance.run(self.workflow);
						} else {
							return Promise.resolve();
						}

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
			} else {
				return Promise.resolve();
			}
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
			debug('inline: ' + strong(self.relPath), 4);
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
			debug('replace: ' + strong(self.relPath), 4);
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
					debug('lint: ' + strong(self.relPath), 4);
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
			debug('escape: ' + strong(self.relPath), 4);
			self.content = content;
		});
};

/**
 * Compress file contents
 * @returns {Promise}
 */
File.prototype.compress = function () {
	var self = this
		, lazy = this.options.runtimeOptions
			? this.options.runtimeOptions.lazy
			: false
		// Allow all lazy JS files to be compressed first time
		, compressible = lazy
			? !~this.content.indexOf('require.register(')
			: this.getIsWriteable()

	// Only compress writeable files
	if (compressible) {
		return commands['compress'](this.type, this.content)
			.then(function (content) {
				print(""
					+ colour('compressed', cnsl.GREEN)
					+ " "
					+ strong(self.relPath), 3);
				self.content = content;
			});
	} else {
		return Promise.resolve();
	}
};

/**
 * Wrap JS file contents in a module definition
 * @returns {Promise}
 */
File.prototype.wrap = function () {
	var self = this
		, lazy = this.options.runtimeOptions
			? this.options.runtimeOptions.lazy
			: false;

	return commands['wrap'](this.id, this.content, lazy)
		.then(function (content) {
			debug('wrap: ' + strong(self.relPath), 4);
			self.content = content;
		});
};

/**
 * Concatenate file contents
 * @returns {Promise}
 */
File.prototype.concat = function () {
	var self = this;

	// Only concat root files
	if (this.getIsWriteable()) {
		return commands['concat'](this.type, this.content, this.getDependencies(true))
			.then(function (content) {
				debug('concat: ' + strong(self.relPath), 4);
				self.content = content;
			});
	} else {
		return Promise.resolve();
	}
};

/**
 * Write file contents to disk
 * @param {String} filepath
 * @param {Object} options
 * @returns {Promise}
 */
File.prototype.write = function (filepath, options) {
	var self = this;

	if (this.getIsWriteable()) {
		if ('object' == typeof filepath) {
			options = filepath;
			filepath = null;
		}
		filepath = filepath || this.outputPath;
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

		// Write
		return write(filepath, this.content)
			.then(function (filepath) {
				print(colour('built', cnsl.GREEN)
					+ " "
					+ strong(path.relative(process.cwd(), filepath)), 3);
				return filepath;
			});
	} else {
		return Promise.resolve();
	}
};

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function (hard) {
	// console.log('***********reset', this.id)
	// Reset nested dependencies
	this.dependencies.forEach(function (dependency) {
		dependency.reset();
	});
	this.isLocked = false;
	this.workflow = null;
	this.outputPath = '';
	this.dependants = [];
	this.dependencies = [];
	this.dependencyReferences = [];
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