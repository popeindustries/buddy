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
	// Return instance
	return new File(filepath, basepath, options);
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
	this._content = '';
	// debug("created " + this.type + " File instance " + (strong(path.relative(process.cwd(), this.filepath))) + " with moduleID: " + (strong(this.moduleID)), 3);
}

File.prototype.parse = function() {

};

File.prototype.reset = function() {

};

File.prototype.destroy = function() {

};


