var path = require('path')
	, async = require('async')
	, transfigure = require('transfigure')
	, resolve = require('dependency-resolver')
	, extend = require('lodash').extend
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong
	, cache = {};

var RE_BUILT_HEADER = /^\/\*BUILT/g
	, RE_ESCAPE = /\\|\r?\n|"/g
	, ESCAPE_MAP = {
		'\\': '\\\\',
		'\n': '\\n',
		'\r\n': '\\n',
		'"': '\\"'
	};

/**
 *
 */
module.exports = function(filepath, options) {
	// Return cached if it exists
	if (cache[filepath]) return cache[filepath];
	// Create new instance
	var instance = new File(filepath, options);
	extend(instance, options);
	instance.id = identify(filepath, options.sources);
	cache[filepath] = instance;
	debug("created "
		+ instance.type
		+ " File instance "
		+ (strong(path.relative(process.cwd(), instance.filepath))), 3);
	return instance;
};

function identify (filepath, sources) {
	var id;
	for (var i = 0, n = sources.length; i < n; i++) {
		if (~filepath.indexOf(sources[i])) {
			// Resolve id relative to source directory
			id = path.relative(sources[i], filepath).replace(path.extname(filepath), '');
			// Replace path separators
			if (process.platform == 'win32') id = id.replace(path.sep, '/');
			// Handle
			if (/index$/.test(id)) {
				if (id == 'index') id = path.basename(path.join(filepath, '..'));
				else id = id.slice(0, -6);
			}
			return id;
		}
	}
}

/**
 * Constructor
 */
function File(filepath) {
/* Decorated properties
	this.type = '';
	this.sources = null;
	this.fileFilter = null;
	this.fileExtensions = null;
*/
	this.id = '';
	this.filepath = filepath;
	this.name = path.basename(this.filepath);
	this.dependencies = [];
	this.isDependency = false;
	this.main = false;
	this._content = '';
	this._transfiguredContent = '';
}

File.prototype.process = function(main, commands, fn) {
	this.main = main;
	commands = commands.map(function(command) {
		return this[command];
	}, this);
	async.series(commands, fn);
};

File.prototype.reset = function() {

};

File.prototype.destroy = function() {
	delete cache[this.filepath];
};

File.prototype.transfigure = function(fn) {
	transfigure(this.filepath, function(err, transfiguredContent, content) {
		if (err) return fn(err);
		debug("compiled: " + (strong(path.relative(process.cwd(), this.filepath))), 3);
		this._content = content;
		this._transfiguredContent = transfiguredContent;
		fn();
	}.bind(this));
};

File.prototype.resolve = function(fn) {
	console.log('resolve');
	fn();
};

File.prototype.escape = function(fn) {
	console.log('escape');
	fn();
};

File.prototype.compress = function(fn) {
	console.log('compress');
	fn();
};

File.prototype.wrap = function(fn) {
	console.log('wrap');
	fn();
};

File.prototype.concat = function(fn) {
	console.log('concat');
	fn();
};

File.prototype.write = function(fn) {
	console.log('write');
	fn();
};
