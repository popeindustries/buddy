var RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Concatenate all dependencies for 'file'
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	file.content = (file.type == 'js')
		? concatJS(file, options.fileCache)
		: inlineCSS(file, options.fileCache);
	fn(null, file);
};

/**
 * Get inlined CSS 'file' content
 * @param {File} file
 * @param {Cache} fileCache
 * @returns {String}
 */
function inlineCSS (file, fileCache) {
	var inline = function(file, dependant) {
		var content = file.content
			, inlineContent, re, id;
		file.dependencies.forEach(function(dependency) {
			id = dependency.id;
			dependency = fileCache.getItem(dependency.filepath);
			if (dependency != dependant) {
				dependency.isDependency = true;
				// Inline nested dependencies
				inlineContent = dependency.dependencies.length
					? inline(dependency, file)
					: dependency.content;
				// Replace @import with inlined content
				re = new RegExp("^@import\\s['|\"]" + id + "['|\"];?\\s*$", 'img');
				content = content.replace(re, inlineContent + '\n');
			}
		});
		return content;
	};
	// Remove comments
	// TODO: necessary?
	return inline(file).replace(RE_CSS_COMMENT_LINES, '');
}

/**
 * Get concatenated JS 'file' content
 * @param {File} file
 * @param {Cache} fileCache
 * @returns {String}
 */
function concatJS (file, fileCache) {
	var contents = [];
	var add = function(file, dependant) {
		// Add nested dependencies
		file.dependencies.forEach(function(dependency) {
			dependency = fileCache.getItem(dependency.filepath);
			// Protect against duplicates and circular references
			if(dependency != dependant && !dependency.isDependency) {
				dependency.isDependency = true;
				add(dependency, file);
			}
		});
		// Store if not already
		if (!~contents.indexOf(file.content)) contents.push(file.content);
	};
	add(file);
	return contents.join('\n');
}