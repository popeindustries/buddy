var cleanCSS = require('clean-css');

module.exports = {
	name: 'cleancss',
	category: 'css',
	type: 'compressor',

	/**
	 * Compress 'data'
	 * @param {String} data
	 * @param {Function} fn(err, compressed)
	 */
	compress: function(data, fn) {
		try {
			var compressed = cleanCSS.process(data);
			fn(null, compressed);
		} catch (err) {
			fn(err);
		}
	}
};
