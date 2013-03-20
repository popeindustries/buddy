var RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in file 'content'
 * @param {String} type
 * @param {String} content
 * @return {Array}
 */
module.exports = function(type, content) {
	var deps = []
		, re_comments = (type == 'js') ? RE_JS_COMMENT_LINES : RE_CSS_COMMENT_LINES
		, re_dep = (type == 'js') ? RE_REQUIRE : RE_IMPORT
		, match;
	// Remove commented lines
	content = content.replace(re_comments, '');
	// Find dependency references
	while (match = re_dep.exec(content)) {
		deps.push(match[1]);
	}
	return deps;
}