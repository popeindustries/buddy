var fs = require('fs')
	, path = require('path')
	, mkdir = require('recur-fs').mkdir;

/**
 * Write contents of 'file' to disk
 * @param {Object} file
 * @param {String} filepath
 * @param {Function} fn(err, file)
 */
module.exports = function (file, filepath, fn) {
	mkdir(filepath, function (err) {
		if (err) return fn(err);
		fs.writeFile(filepath, file.content, 'utf8', function (err) {
			if (err) return fn(err);
			return fn(null, file);
		});
	});
};