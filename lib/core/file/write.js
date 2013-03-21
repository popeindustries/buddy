var fs = require('fs');

/**
 * Write contents of 'file' to disk
 * @param {Object} file
 * @param {Function} fn(err, file)
 */
module.exports = function(file, fn) {
	fs.writeFile(file.filepath, 'utf8', function(err) {
		if (err) return fn(err);
		fn(null, file);
	}
}