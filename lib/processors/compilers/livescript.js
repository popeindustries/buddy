var livescript = require('LiveScript');

module.exports = {
	name: 'livescript',
	extension: 'ls',
	category: 'js',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {String} filepath
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(data, filepath, fn) {
		try {
			// Compile without function wrapper
			var compiled = livescript.compile(data, {bare: true});
			fn(null, compiled);
		} catch (err) {
			fn(err, '');
		}
	}
};
