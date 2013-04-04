var fs = require('fs');

/**
 * Read contents of 'file'
 * @param {Object} file
 * @param {Function} fn(err, file)
 */
module.exports = function(file, fn) {
	try {
		var content = fs.readFileSync(file.filepath, 'utf8');
		file.content = content;
		file.originalContent = content;
		return fn(null, file);
	} catch (err) {
		return fn(err);
	}
}