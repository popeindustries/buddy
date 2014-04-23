var unique = require('lodash').uniq
	, path = require('path')
	, fs = require('fs')
	, inlineSource = require('inline-source')

	, RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]\)?/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	// HTML templates include/extend
	, RE_INCLUDE = /(?:{>|include|{% extends|{% include)\s?['|"]?(.*?)['|"]?[\s|}]/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @returns {Array}
 */
module.exports = function (filepath, type, content) {
	var deps = []
		, inlineErrors = []
		, re_comments, re_dep, match, inlined, jsonpath;

	if (type == 'js') {
		// Remove commented lines
		content = content.replace(RE_JS_COMMENT_LINES, '');
		re_dep = RE_REQUIRE;
	} else if (type == 'css') {
		// Remove commented lines
		content = content.replace(RE_CSS_COMMENT_LINES, '');
		re_dep = RE_IMPORT;
	} else {
		re_dep = RE_INCLUDE;
		// Parse inlineable HTML content
		deps = inlineSource.parse(filepath, content);
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