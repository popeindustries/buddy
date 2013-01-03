var path = require('path');

var RE_WIN_SEPARATOR = /\\\\?/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

module.exports = {
	name: 'css',
	category: 'css',
	type: 'module',

	/**
	 * Retrieve a module's id based on it's 'qualifiedFilename'
	 * @param {String} qualifiedFilename
	 * @return {String}
	 */
	getModuleID: function(qualifiedFilename) {
		// Convert to lowercase
		var module = qualifiedFilename.toLowerCase();
		// Fix path separator for windows
		if (process.platform === 'win32') module = module.replace(RE_WIN_SEPARATOR, '/');
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
		// Match all uses of '@import'
		while (match = RE_IMPORT.exec(content)) {
			dep = match[1].replace('.css', '');
			// Force relative path
			if (dep.indexOf('/') == -1) dep = './' + dep;
			parts = dep.split('/');
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
	 * @return {String}
	 */
	wrapModuleContents: function(content, id) {
		// No op
		return content;
	},

	/**
	 * Concatenate file and dependency content
	 * @param {File} file
	 * @return String
	 */
	concat: function(file) {
		var inline = function(file, content) {
			file.dependencies.forEach(function(dependency) {
				var id, inlineContent, re;
				if ('string' !== typeof dependency) {
					// First inline dependencies if necessary
					inlineContent = dependency.dependencies.length
						? inline(dependency, dependency.getContent(false))
						: dependency.getContent(false);
					// Replace @import with inline content
					// Use fuzzy match to get around absolute and relative pathing differences
					id = dependency.moduleID.split('/').reverse()[0];
				} else {
					// Dependency already inlined
					inlineContent = '';
					id = dependency.split('/').reverse()[0];
				}
				re = new RegExp("^@import\\s['|\"](?:\\.\\/)?(?:\\w*\/)?" + id + "(?:\\.css)?['|\"];?\\s*$", 'im');
				content = content.replace(re, inlineContent + '\n');
			});
			return content;
		};

		// Remove comments and return
		return inline(file, file.getContent(false)).replace(RE_COMMENT_LINES, '');
	}
};
