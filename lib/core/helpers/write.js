var co = require('co')
	, thunkify = require('thunkify')
	, writeFile = thunkify(require('fs').writeFile)
	, mkdir = thunkify(require('recur-fs').mkdir);

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 * @returns {String}
 */
module.exports = co(function* (filepath, content) {
	yield mkdir(filepath);
	yield writeFile(filepath, content, 'utf8');
});