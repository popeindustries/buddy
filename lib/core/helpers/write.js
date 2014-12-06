var Promise = require('bluebird')
	, writeFile = Promise.promisify(require('fs').writeFile)
	, mkdir = Promise.promisify(require('recur-fs').mkdir);

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 * @returns {Promise(String)}
 */
module.exports = function (filepath, content) {
	return mkdir(filepath)
		.then(function () {
			return writeFile(filepath, content, 'utf8');
		// Return filepath on completion
		}).return(filepath);
};