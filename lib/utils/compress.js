var uglify = require('uglify-js')
	, cleanCSS = require('clean-css');

/**
 * Compress 'data'
 * @param {String} type
 * @param {String} content
 * @param {Function} fn(err, compressed)
 */
module.exports = function(type, content, fn) {
	try {
		var compressed = (type == 'js')
			? uglify.minify(content, {fromString: true}).code
			: cleanCSS.process(content);
		fn(null, compressed);
	} catch (err) {
		fn(err);
	}
};