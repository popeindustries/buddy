var fs = require('fs')
	, inlineSource = require('inline-source')
	, path = require('path')
	, unique = require('lodash/array/unique')

	, RE_REQUIRE = /require\(['|"](.*?)['|"]\)/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	// HTML templates include/extend
	, RE_INCLUDE = /(?:{>|include|{% extends|{% include)\s?['|"]?(.*?)['|"]?[\s|}]/g
	// Line starting with '//'
	, RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm
	// Multi line block '/** ... */'
	, RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @returns {Array}
 */
module.exports = function (filepath, type, content) {
	var deps = []
		, inlineErrors = []
		, re_comments, re_dep, match, inlined, jsonpath;

	if (type == 'html') {
		re_dep = RE_INCLUDE;
		// Parse inlineable HTML content
		deps = inlineSource.parse(filepath, content);
	} else {
		// Remove commented lines
		content = content.replace(RE_COMMENT_SINGLE_LINE, '');
		content = content.replace(RE_COMMENT_MULTI_LINES, '');
		re_dep = (type == 'js') ? RE_REQUIRE : RE_IMPORT;
	}

	while (match = re_dep.exec(content)) {
		// Store dependency
		deps.push({
			filepath: match[1],
			context: match[0]
		});
	}

	// Filter duplicates
	return unique(deps, function (dep) {
		return dep.filepath;
	});
};