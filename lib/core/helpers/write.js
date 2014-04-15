var thunkify = require('thunkify')
	, writeFile = thunkify(require('fs').writeFile)
	, mkdir = thunkify(require('recur-fs').mkdir);

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 */
module.exports = function* (filepath, content) {
	yield mkdir(filepath);
	yield writeFile(filepath, content, 'utf8');
};