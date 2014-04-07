var Promise = require('bluebird')

	, RE_ESCAPE = /\\|\r?\n|"/g
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
 * @returns {Promise}
 */
module.exports = Promise.method(function (content) {
	return '"'
		+ content.replace(RE_ESCAPE, function (m) { return ESCAPE_MAP[m]; })
		+ '"';
});