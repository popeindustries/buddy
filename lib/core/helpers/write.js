var Promise = require('bluebird')
	, writeFile = Promise.promisify(require('fs').writeFile)
	, mkdir = Promise.promisify(require('recur-fs').mkdir);

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 * @returns {Promise(filepath)}
 */
module.exports = Promise.method(function (filepath, content) {
	mkdir(filepath)
		.then(function () {
			// Return filepath on completion
			return writeFile(filepath, file.content, 'utf8').return(filepath);
		});
});