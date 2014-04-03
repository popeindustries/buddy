var uglify = require('uglify-js')
	, csso = require('csso');

/**
 * Compress 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, compressed)
 */
module.exports = function (file, options, fn) {
	try {
		file.content = (file.type == 'js')
			? uglify.minify(file.content, {fromString: true}).code
			: csso.justDoIt(file.content);
		return fn(null, file);
	} catch (err) {
		return fn(err);
	}
};