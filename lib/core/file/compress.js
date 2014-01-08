var uglify = require('uglify-js')
	, CleanCSS = require('clean-css');

/**
 * Compress 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, compressed)
 */
module.exports = function(file, options, fn) {
	try {
		file.content = (file.type == 'js')
			? uglify.minify(file.content, {fromString: true}).code
			: new CleanCSS().minify(file.content);
		return fn(null, file);
	} catch (err) {
		return fn(err);
	}
};