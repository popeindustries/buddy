var inlineSource = require('inline-source')
	, Promise = require('bluebird')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Concatenate all dependencies for 'file'
 * @param {Object} file
 * @returns {Promise}
 */
module.exports = Promise.method(function (file) {
	return (file.type == 'js')
		? concatJS(file)
		: Promise.resolve(file.content);
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