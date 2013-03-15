var handlebars = require('handlebars');

module.exports = {
	name: 'handlebars',
	extension: 'handlebars',
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
			var compiled = handlebars.precompile(data, {simple:true, amd:true});
			fn(null, 'module.exports = Handlebars.template(' + compiled + ');');
		} catch (err) {
			fn(err, '');
		}
	}
};
