var RE_ESCAPE = /\\|\r?\n|"/g
	, ESCAPE_MAP = {
		'\\': '\\\\',
		'\n': '\\n',
		'\r\n': '\\n',
		'"': '\\"'
	};

/**
 * Escape 'file' content and stringify for lazy js modules
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function (file, options, fn) {
	file.content = '"' + file.content.replace(RE_ESCAPE, function (m) {
		return ESCAPE_MAP[m];
	}) + '"';
	return fn(null, file);
}