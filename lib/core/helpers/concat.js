var Promise = require('bluebird')
	, lodash = require('lodash')
	, flatten = lodash.flatten
	, unique = lodash.unique;

/**
 * Concatenate all 'dependencies' content
 * @param {String} type
 * @param {String} content
 * @param {Array} dependencies
 * @returns {Promise(String)}
 */
module.exports = Promise.method(function (type, content, dependencies) {
	switch (type) {
		case 'js':
			return concatJS(content, dependencies);
		case 'css':
			return concatCSS(content, dependencies);
		default:
			return Promise.resolve(content);
	}
});

/**
 * Get concatenated JS 'content'
 * @param {String} content
 * @param {Array} dependencies
 * @returns {String}
 */
function concatJS (content, dependencies) {
	var contents = dependencies.map(function (dependency) {
		return dependency.content;
	});
	contents.push(content);
	return contents.join('\n');
}