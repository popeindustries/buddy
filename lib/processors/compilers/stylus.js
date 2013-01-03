var stylus = require('stylus');

module.exports = {
	name: 'stylus',
	extension: 'styl',
	category: 'css',
	type: 'compiler',

	/**
	 * Compile 'data' and pass 'sources' for dependency reference
	 * @param {String} data
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(content, fn) {
		var stylc = stylus(content).set('paths');
		stylc.render(function(err, css) {
			if (err) fn(err, '');
			else fn(null, css);
		});
	}
};
