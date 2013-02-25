var less = require('less');

module.exports = {
	name: 'less',
	extension: 'less',
	category: 'css',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(data, fn) {
		var parser = new less.Parser();
		parser.parse(data, function(err, tree) {
			if (err) fn(err, '');
			else fn(null, tree.toCSS());
		});
	}
};
