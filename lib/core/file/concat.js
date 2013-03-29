var RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Concatenate all dependencies for 'file'
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	file.content = (file.type == 'js')
		? concatJS(file)
		: inlineCSS(file)
	fn(null, file);
};

/**
 * Get inlined CSS 'file' content
 * @param {File} file
 * @returns {String}
 */
function inlineCSS (file) {
	var inline = function(file, dependant) {
		var content = file.content
			, inlineContent, re;
		file.dependencies.forEach(function(dependency) {
			if (dependency != dependant) {
				// Inline nested dependencies
				inlineContent = dependency.instance.dependencies.length
					? inline(dependency.instance, file)
					: dependency.instance.content;
				// Replace @import with inlined content
				re = new RegExp("^@import\\s['|\"]" + dependency.id + "['|\"];?\\s*$", 'img');
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
 * @returns {String}
 */
function concatJS (file) {
	var contents = [];
	var add = function(file, dependant) {
		// Add nested dependencies
		file.dependencies.forEach(function(dependency) {
			dependency = dependency.instance;
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