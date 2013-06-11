var path = require('path')
	, fs = require('fs');

var RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]\)?/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm
	, RE_JSON = /\.json$/;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	var deps = []
		, re_comments = (file.type == 'js') ? RE_JS_COMMENT_LINES : RE_CSS_COMMENT_LINES
		, re_dep = (file.type == 'js') ? RE_REQUIRE : RE_IMPORT
		// Remove commented lines
		, content = file.content.replace(re_comments, '')
		, match;
	// Find dependency references
	while (match = re_dep.exec(content)) {
		// Inline json require
		if (RE_JSON.test(match[1])) {
			inlineJSON(file, match[1], match[0]);
		// Store dependency
		} else {
			if (!~deps.indexOf(match[1])) deps.push(match[1]);
		}
	}
	file.dependencies = deps;
	return fn(null, file);
};

/**
 * Inline a require('file.json') statement
 * @param {String} jsonPath
 * @param {String} requireStatement
 * @param {Regexp} match
 */
function inlineJSON (file, jsonPath, requireStatement) {
	var filepath = path.resolve(path.dirname(file.filepath), jsonPath)
		, json = fs.existsSync(filepath)
			? fs.readFileSync(filepath, 'utf8')
			: '';
	try {
		json = JSON.stringify(JSON.parse(json));
	} catch (err) {
		json = '\"\"';
	}
	file.content = file.content.replace(requireStatement, json);
}