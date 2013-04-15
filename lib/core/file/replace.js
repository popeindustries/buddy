/**
 * Replace all relative dependency id's with fully resolved in 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	var fileCache = options.fileCache
		, id, re;
	file.dependencies.forEach(function(dependency) {
		if (dependency.id.charAt(0) == '.') {
			file.content = file.content.replace(dependency.id, dependency.idFull, 'gi');
		}
	});
	fn(null, file);
}