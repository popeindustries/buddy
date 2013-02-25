var jade = require('jade');

module.exports = {
	name: 'jade',
	extension: 'jade',
	category: 'html',
	type: 'compiler',

	/**
	 * Compile 'data'
	 * @param {String} data
	 * @param {Function} fn(err, compiled)
	 */
	compile: function(content, fn) {
		jade.render(content, {client: false, compileDebug: false}, function(err, html) {
			if (err) fn(err, '');
			else fn(null, html);
		});
	}
};
