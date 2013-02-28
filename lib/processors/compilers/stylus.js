var stylus = require('stylus');

module.exports = {
	name: 'stylus',
	extension: 'styl',
	category: 'css',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {String} filepath
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(data, filepath, fn) {
		var stylc = stylus(data).set('paths');
		stylc.render(function(err, css) {
			if (err) fn(err, '');
			else fn(null, css);
		});
	}
};
