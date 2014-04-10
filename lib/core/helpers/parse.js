var Promise = require('bluebird')
	, unique = require('lodash').uniq
	, path = require('path')
	, fs = require('fs');

var RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]\)?/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_INCLUDE = /(?:{>|include|{% extends|{% include)\s?['|"]?(.*?)['|"]?[\s|}]/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @returns {Promise(dependencies)}
 */
module.exports = Promise.method(function (filepath, type, content) {
	var deps = []
		, inlineErrors = []
		, re_comments, re_dep, match, inlined, jsonpath;

	if (type == 'js') {
		// remove commented lines
		content = content.replace(RE_JS_COMMENT_LINES, '');
		re_dep = RE_REQUIRE;
	} else if (type == 'css') {
		// remove commented lines
		content = content.replace(RE_CSS_COMMENT_LINES, '');
		re_dep = RE_IMPORT;
	} else {
		re_dep = RE_INCLUDE;
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
});