var Promise = require('bluebird')
	, path = require('path')
	, fs = require('fs');

var RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]\)?/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_INCLUDE = /(?:{>|include|{% extends|{% include)\s?['|"]?(.*?)['|"]?[\s|}]/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm
	, RE_JSON = /\.json$/;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @returns {Promise}
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
		// TODO: move to concat
		// Inline json require
		if (type == 'js' && RE_JSON.test(match[1])) {
			// jsonpath = path.resolve(path.dirname(filepath), match[1]);
			// json = getJSON(jsonpath);
			// if (!json) {
			// 	json = '{}';
			// 	// Store errors
			// 	inlineErrors.push(jsonpath);
			// }
			// content = content.replace(match[0], json);
		// Store dependency
		} else {
			if (!~deps.indexOf(match[1])) deps.push(match[1]);
		}
	}

	return deps;
});

/**
 * Load and parse json
 * @param {String} filepath
 * @returns {String}
 */
function getJSON (filepath) {
	var json = fs.existsSync(filepath)
			? fs.readFileSync(filepath, 'utf8')
			: '';

	console.log(json)
	// Validate by converting to/from object
	try {
		json = JSON.stringify(JSON.parse(json));
	} catch (err) {
		json = '';
	}

	return json;
}