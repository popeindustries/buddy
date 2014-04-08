var Promise = require('bluebird');

/**
 * Replace all relative dependency id's with fully resolved in 'file' content
 * @param {String} content
 * @param {Array} dependencies
 * @returns {Promise}
 */
module.exports = Promise.method(function (content, dependencies) {
	dependencies.forEach(function (dependency) {
		if (dependency.id.charAt(0) == '.') {
			content = content.replace(new RegExp(dependency.id, 'gim'), dependency.idFull);
		}
	});

	return content;
});