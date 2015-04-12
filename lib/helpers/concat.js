/**
 * Concatenate all 'dependencies' content
 * @param {String} type
 * @param {String} content
 * @param {Array} dependencies
 * @returns {String}
 */
module.exports = function (type, content, dependencies) {
	return (type == 'js')
		? concatJS(content, dependencies)
		: content;
};

/**
 * Get concatenated JS 'content'
 * @param {String} content
 * @param {Array} dependencies
 * @returns {String}
 */
function concatJS (content, dependencies) {
	var contents = dependencies.filter(function (dependency) {
		return dependency.extension != 'json';
	}).map(function (dependency) {
		return dependency.content;
	});
	contents.push(content);
	return contents.join('\n');
}