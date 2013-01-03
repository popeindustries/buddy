var coffee = require('coffee-script');

module.exports = {
	name: 'coffeescript',
	extension: 'coffee',
	category: 'js',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(data, fn) {
		try {
			// Compile without function wrapper
			var compiled = coffee.compile(data, {bare: true});
			fn(null, compiled);
		} catch (err) {
			fn(err, '');
		}
	}
};
