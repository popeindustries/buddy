var path = require('path')
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

module.exports = function(filepath, basepath, options) {
	var instance = new File(filepath, basepath, options);
	debug("created "
		+ instance.type
		+ " File instance "
		+ (strong(path.relative(process.cwd(), instance.filepath))), 3);
	return instance;
};

/**
 * Constructor
 */
function File(filepath, basepath, options) {
	this.filepath = filepath;
	this.basepath = basepath;
	this.options = options;
	this.name = path.basename(this.filepath);
	this.dependencies = [];
	this.isDependency = false;
	this.main = false;
	this._content = '';
	this._transfiguredContent = '';
}

File.prototype.parse = function() {

};

File.prototype.reset = function() {

};

File.prototype.destroy = function() {

};


