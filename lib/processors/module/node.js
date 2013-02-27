var path = require('path')
	, term = require('buddy-term')
	, indent = term.indent;

var RE_WIN_SEPARATOR = /\\\\?/g
	, RE_MODULE = /require\.register[\s|\(].+(?:function)? *\( *module *, *exports *, *require *\)/gm
	, RE_MODULE_LAZY = /require\.register[\s|\(].+\)?/gm
	, RE_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]/g
	, RE_SPACES = /\s/
	, RE_ESCAPE = /\\|\r?\n|"/g
	, ESCAPE_MAP = {
		'\\': '\\\\',
		'\n': '\\n',
		'\r\n': '\\n',
		'"': '\\"'
	};

module.exports = {
	name: 'node',
	category: 'js',
	type: 'module',

	/**
	 * Retrieve a module's id based on it's 'qualifiedFilename'
	 * @param {String} qualifiedFilename
	 * @return {String}
	 */
	getModuleID: function(qualifiedFilename) {
		// Convert to lowercase and remove spaces
		var module = qualifiedFilename.toLowerCase().replace(RE_SPACES, '');
		// Fix path separator for windows
		if (process.platform == 'win32') module = module.replace(RE_WIN_SEPARATOR, '/');
		return module;
	},

	/**
	 * Retrieve all module references in file 'content'
	 * Convert all references relative to 'id'
	 * @param {String} content
	 * @param {String} id
	 * @return {Array}
	 */
	getModuleDependencies: function(content, id) {
		var deps = []
			, dep, d, match, part, parts;
		// Remove commented lines
		content = content.replace(RE_COMMENT_LINES, '');
		while (match = RE_REQUIRE.exec(content)) {
			dep = match[1];
			parts = dep.split('/');
			// Resolve relative path
			if (dep.charAt(0) == '.') {
				parts = id.split('/');
				parts.pop();
				d = dep.split('/');
				for (var i = 0, n = d.length; i < n; ++i) {
					part = d[i];
					if (part == '..') {
						parts.pop();
					} else if (part != '.') {
						parts.push(part);
					}
				}
			}
			deps.push(parts.join('/'));
		}
		return deps;
	},

	/**
	 * Wrap 'content' in module definition if not already wrapped
	 * @param {String} content
	 * @param {String} id
	 * @param {Boolean} lazy
	 * @return {String}
	 */
	wrapModuleContents: function(content, id, lazy) {
		if (lazy == null) lazy = false;
		var re = lazy
			? RE_MODULE_LAZY
			: RE_MODULE;
		// Reset
		re.lastIndex = 0;
		if (!re.test(content)) {
			if (lazy) {
				content = "require.register('"
					+ id
					+ "', "
					+ content
					+ ");";
			} else {
				content = "require.register('"
					+ id
					+ "', function(module, exports, require) {\n"
					+ (indent(content, 2))
					+ "\n});";
			}
		}
		return content;
	},

	/**
	 * Concatenate file and dependency content
	 * @param {File} file
	 * @return String
	 */
	concat: function(file) {
		var contents = []
			, add;
		// Inner function
		add = function(file) {
			var content;
			// First add dependencies
			file.dependencies.forEach(function(dependency) {
				if ('string' !== typeof dependency) add(dependency);
			});
			// Store if not already stored
			content = file.getContent(true);
			if (contents.indexOf(content) == -1) contents.push(content);
		};

		add(file);
		return contents.join('\n');
	}
};
