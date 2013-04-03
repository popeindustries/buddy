var uglify = require('uglify-js')
	, cleanCSS = require('clean-css');

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
			: cleanCSS.process(file.content);
		return fn(null, file);
	} catch (err) {
		return fn(err);
	}
};