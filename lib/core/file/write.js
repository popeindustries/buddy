var fs = require('fs');

/**
 * Write contents of 'file' to disk
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	fs.writeFile(file.filepath, 'utf8', function(err) {
		if (err) return fn(err);
		return fn(null, file);
	});
}