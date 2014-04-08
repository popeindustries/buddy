var Promise = require('bluebird')
	, writeFile = Promise.promisify(require('fs').writeFile)
	, mkdir = Promise.promisify(require('recur-fs').mkdir);

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 * @returns {Promise}
 */
module.exports = Promise.method(function (filepath, content) {
	mkdir(filepath)
		.then(function () {
			return writeFile(filepath, file.content, 'utf8');
		});
});