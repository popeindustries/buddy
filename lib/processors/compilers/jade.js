var jade = require('jade');

module.exports = {
	name: 'jade',
	extension: 'jade',
	category: 'html',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {String} filepath
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(data, filepath, fn) {
		jade.render(data, {filename: filepath, client: false, compileDebug: false, pretty: true}, function(err, html) {
			if (err) fn(err, '');
			else fn(null, html);
		});
	}
};
