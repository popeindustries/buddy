var inlineSource = require('inline-source')
	, Promise = require('bluebird')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Concatenate all dependencies for 'file'
 * @param {Object} file
 * @returns {Promise}
 */
module.exports = Promise.method(function (file) {
	switch (file.type) {
		case 'js':
			return concatJS(file);
		case 'css':
			return inlineCSS(file);
		case 'html':
			return inlineHTML(file);
	}
});

/**
 * Get concatenated JS 'file' content
 * @param {File} file
 * @returns {String}
 */
function concatJS (file) {
	var contents = [];

	var add = function (file, dependant) {
		// Add nested dependencies
		file.dependencies.forEach(function (dependency) {
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

/**
 * Get inlined CSS 'file' content
 * @param {File} file
 * @returns {String}
 */
function inlineCSS (file) {
	var inline = function (file, dependant) {
		var content = file.content
			, inlineContent, re;

		file.dependencies.forEach(function (dependency) {
			// Protect against circular references
			if (dependency != dependant) {
				dependency.isDependency = true;
				// Inline nested dependencies
				inlineContent = dependency.dependencies.length
					? inline(dependency, file)
					: dependency.content;
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
 * Get inlined HTML 'file' content and flag dependencies
 * @param {File} file
 * @returns {String}
 */
function inlineHTML (file) {
	var add = function (file, dependant) {
		// Flag nested dependencies
		file.dependencies.forEach(function (dependency) {
			// Protect against circular references
			if(dependency != dependant) {
				dependency.isDependency = true;
				add(dependency, file);
			}
		});
	};

	add(file);

	// Inline source
	return inlineSource(file.filepath, file.content);
}