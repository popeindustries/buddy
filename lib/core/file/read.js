var fs = require('fs');

/**
 * Read contents of 'file'
 * @param {Object} file
 * @param {Function} fn(err, file)
 */
module.exports = function(file, fn) {
	if (!file.content && !file.originalContent) {
		fs.readFile(file.filepath, 'utf8', function(err, content) {
			if (err) return fn(err);
			file.content = file.originalContent = content;
			return fn(null, file);
		});
	} else {
		return fn(null, file);
	}
}