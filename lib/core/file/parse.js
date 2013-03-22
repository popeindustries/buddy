var RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]/g
	, RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
	, RE_JS_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	if (!file.dependencies) {
		var deps = []
			, re_comments = (file.type == 'js') ? RE_JS_COMMENT_LINES : RE_CSS_COMMENT_LINES
			, re_dep = (file.type == 'js') ? RE_REQUIRE : RE_IMPORT
			// Remove commented lines
			, content = file.content.replace(re_comments, '')
			, match;
		// Find dependency references
		while (match = re_dep.exec(content)) {
			deps.push(match[1]);
		}
		file.dependencies = deps;
	}
	return fn(null, file);
}