var uglify = require('uglify-js');

module.exports = {
	name: 'uglifyjs',
	category: 'js',
	type: 'compressor',

	/**
	 * Compress 'data'
	 * @param {String} data
	 * @param {Function} fn(err, compressed)
	 */
	compress: function(data, fn) {
		try {
			var result = uglify.minify(data, {fromString: true});
			fn(null, result.code);
		} catch (err) {
			fn(err);
		}
	}
};
