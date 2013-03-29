var fs = require('fs')
	, path = require('path')
	, mkdir = require('recur-fs').mkdir
	, BUILT_HEADER = '/*BUILT ';

/**
 * Write contents of 'file' to disk
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	var filepath = options.outputpath;
	// Resolve output path if directory
	if (!path.extname(filepath).length) filepath = path.join(filepath, file.id) + '.' + file.type;
	mkdir(filepath, function(err) {
		if (err) return fn(err);
		// Built header?
		fs.writeFile(filepath, file.content, 'utf8', function(err) {
			if (err) return fn(err);
			return fn(null, file, filepath);
		});
	});
}