'use strict';

var inlineContext = require('inline-source/lib/context')
	, inlineParse = require('inline-source/lib/parse')
	, unique = require('lodash/array/unique')

	, RE_REQUIRE = /require\(['|"](.*?)['|"]\)/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	// HTML templates include/extend
	, RE_INCLUDE = /(?:{>\s?|include |{% extends |{% include )['|"]?(.*?)['|"]?[\s|}]/g
	// Line starting with '//'
	, RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm
	// Multi line block '/** ... */'
	, RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {String} filepath
 * @param {String} type
 * @param {String} content
 * @param {Function} fn(err, deps)
 */
module.exports = function (filepath, type, content, fn) {
	if (type == 'html') {
		// Parse inlineable HTML content
		var context = inlineContext.create({ compress: false });

		context.html = content;
		context.htmlpath = filepath;
		inlineParse(context, function (err) {
			if (err) return fn(err);
			fn(null, match(RE_INCLUDE, content, context.sources.slice()));
		});
	} else {
		// Remove commented lines
		content = content.replace(RE_COMMENT_SINGLE_LINE, '');
		content = content.replace(RE_COMMENT_MULTI_LINES, '');
		fn(null, match((type == 'js') ? RE_REQUIRE : RE_IMPORT, content, []));
	}
};

/**
 * Match 're' in 'content' and store in 'results'
 * @param {RegExp} re
 * @param {String} content
 * @param {Array} results
 * @returns {Array}
 */
function match (re, content, results) {
	var m;

	while (m = re.exec(content)) {
		results.push({
			filepath: m[1],
			match: m[0]
		});
	}

	// Filter duplicates
	return unique(results, function (result) {
		return result.filepath;
	});
}