var Promise = require('bluebird');

/**
 * Concatenate all dependencies for 'file'
 * @param {String} type
 * @param {String} content
 * @param {Array} dependencies
 * @returns {Promise(content)}
 */
module.exports = Promise.method(function (type, content, dependencies) {
	return (type == 'js')
		? concatJS(content, dependencies)
		: Promise.resolve(content);
});

/**
 * Get concatenated JS 'file' content
 * @param {String} content
 * @param {Array} dependencies
 * @returns {String}
 */
function concatJS (content, dependencies) {
	var contents = [];

	dependencies.forEach(function (dependency) {
		// Protect against duplicates
		if (dependency.isWriteable && !~contents.indexOf(dependency.content)) {
			contents.push(dependency.content);
			dependency.isWriteable = false;
		}
	});

	contents.push(content);

	return contents.join('\n');
}