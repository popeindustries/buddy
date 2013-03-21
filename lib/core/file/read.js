var fs = require('fs');

/**
 * Read contents of 'file'
 * @param {Object} file
 * @param {Function} fn(err, file)
 */
module.exports = function(file, fn) {
	fs.readFile(file.filepath, 'utf8', function(err, content) {
		if (err) return fn(err);
		file.content = content;
		fn(null, file);
	}
}