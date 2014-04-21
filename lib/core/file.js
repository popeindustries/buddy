var co = require('co')
	, thunkify = require('thunkify')
	, path = require('path')
	, fs = require('fs')
	, readFile = fs.readFileSync
	// , readFile = thunkify(fs.readFile)
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
	, truncate = require('../utils/truncate')
	, cnsl = require('../utils/cnsl')
	, warn = cnsl.warn
	, debug = cnsl.debug
	, colour = cnsl.colour
	, print = cnsl.print
	, strong = cnsl.strong
	, helpers = {
			write: require('./helpers/write'),
			compile: thunkify(require('transfigure')),
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
	this.relPath = truncate(path.relative(process.cwd(), filepath));
	this.extension = path.extname(this.filepath).slice(1);
	this.name = path.basename(this.filepath);
	this.content = '';
	this.originalContent = '';
	this.compiledContent = '';
	this.dependencies = [];
	this.dependencyReferences = [];
	this.workflow = null;
	this.isRoot = false;
	this.isDependency = false;
	this.isLocked = false;

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
	return this.isRoot || !this.isDependency;
};

/**
 * Retrieve flattened dependency tree
 * @returns {Array}
 */
File.prototype.getDependencies = function () {
	var self = this
		, deps = [];

	function add (dependency, dependant) {
		if (dependency !== self && !~deps.indexOf(dependency)) {
			deps.push(dependency);
			dependency.dependencies.forEach(function (dep) {
				// Protect against circular references
				if (dep != dependant) add(dep, dependency);
			});
		}
	};

	this.dependencies.forEach(add);

	return deps;
};

/**
 * Run 'workflow' tasks in sequence
 * @param {Array} workflow
 * @returns {Promise(File)}
 */
File.prototype.run = function * (workflow) {
	var dependencies, cmd;

	if (workflow && this.workflow != workflow) {
		this.workflow = workflow;
		// Execute commands in sequence
		for (var i = 0, n = workflow.length; i < n; i++) {
			cmd = workflow[i];
			if ('GeneratorFunction' == this[cmd].constructor.name) {
				yield this[cmd]();
			} else {
				this[cmd]();
			}
			// Parse needs special handling of dependencies
			if (cmd == 'parse') dependencies = this.dependencies;
		}
	}

	return dependencies;
};

/**
 * Read and store file contents
 * @returns {Function}
 */
File.prototype.load = function () {
	if (!this.originalContent) {
		var content = readFile(this.filepath, 'utf8');
		debug('load: ' + strong(this.relPath), 4);
		this.content = this.originalContent = content;
	} else {
		this.content = this.originalContent;
	}
};

/**
 * Compile file contents
 */
File.prototype.compile = function * () {
	// Only compile if not already
	if (!this.compiledContent) {
		var options = {}
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
			// Gather all directories
			options.paths = factory.cache.getDirs();
		}

		this.content = yield helpers['compile'](this.filepath, this.content, options);
		debug('compile: ' + strong(this.relPath), 4);
	}
};

/**
 * Parse file contents for dependency references
 * @returns {Array}
 */
File.prototype.parse = function () {
	var dependencies = helpers['parse'](this.filepath, this.type, this.content)
		, filepath, instance;

	debug('parse: ' + strong(this.relPath), 4);
	if (dependencies) {
		dependencies.forEach(function (dependency) {
			// Validate and add
			filepath = resolve(this.filepath, dependency.filepath, this.options);
			instance = factory(filepath, this.options);
			if (filepath && instance) {
				// Save context for future inlining
				this.dependencyReferences.push(dependency);
				// Store instance
				dependency.instance = instance;
				// Process if not locked (parent target files are locked)
				if (!instance.isLocked) {
					// Store if not already stored
					if (!~this.dependencies.indexOf(instance)) {
						instance.isDependency = true;
						this.dependencies.push(instance);
					}
				}

			// Unable to resolve filepath
			} else {
				warn("dependency "
					+ (strong(dependency.filepath))
					+ " for "
					+ (strong(this.id))
					+ " not found (ids are case-sensitive)", 4);
			}
		}, this);
	}

	return this.dependencies;
};

/**
 * Inline dependency content
 */
File.prototype.inline = function () {
	this.content = helpers['inline'](this.filepath, this.type, this.content, this.dependencyReferences);
	debug('inline: ' + strong(this.relPath), 4);
};

/**
 * Replace relative dependency references with fully resolved
 */
File.prototype.replace = function () {
	this.content = helpers['replace'](this.content, this.dependencyReferences);
	debug('replace: ' + strong(this.relPath), 4);
};

/**
 * Lint file contents
 */
File.prototype.lint = function () {
	// Don't lint compiled files
	if (this.extension == this.type) {
		var warnings = helpers['lint'](this.type, this.content)
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
			return warnings;
		} else {
			debug('lint: ' + strong(this.relPath), 4);
		}
	}
};

/**
 * Escape file contents for lazy js modules
 */
File.prototype.escape = function () {
	this.content = helpers['escape'](this.content);
	debug('escape: ' + strong(this.relPath), 4);
};

/**
 * Compress file contents
 */
File.prototype.compress = function () {
	// TODO: trap errors here
	this.content = helpers['compress'](this.type, this.content);
	// TODO: suppress during first lazy compression
	print(""
		+ colour('compressed', cnsl.GREEN)
		+ " "
		+ strong(this.relPath), 3);
};

/**
 * Wrap JS file contents in a module definition
 */
File.prototype.wrap = function () {
	var lazy = this.options.runtimeOptions
		? this.options.runtimeOptions.lazy
		: false;

	this.content = helpers['wrap'](this.id, this.content, lazy);
	debug('wrap: ' + strong(this.relPath), 4);
};

/**
 * Concatenate file contents
 */
File.prototype.concat = function () {
	this.content = helpers['concat'](this.type, this.content, this.getDependencies().reverse());
	debug('concat: ' + strong(this.relPath), 4);
};

/**
 * Write file contents to disk
 * @param {String} filepath
 * @param {Object} options
 * @returns {String}
 */
File.prototype.write = function * (filepath, options) {
	if (filepath) {
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
		yield helpers['write'](filepath, this.content);
		print(colour('built', cnsl.GREEN)
			+ " "
			+ strong(path.relative(process.cwd(), filepath)), 3);

		return filepath;
	}
};

/**
 * Reset content
 * @param {Boolean} hard
 */
File.prototype.reset = function (hard) {
	this.workflow = null;
	this.isRoot = false;
	this.isLocked = false;
	this.isDependency = false;
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