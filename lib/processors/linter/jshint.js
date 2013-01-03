var jshint = require('jshint').JSHINT
	, RE_TRIM = /^\s+|\s+$/;

module.exports = {
	name: 'jshint',
	category: 'js',
	type: 'linter',
	options: {
		curly: true,
		eqeqeq: false,
		immed: true,
		latedef: true,
		newcap: true,
		noarg: true,
		undef: true,
		unused: true,
		eqnull: true,
		es5: false,
		esnext: false,
		bitwise: true,
		strict: false,
		trailing: false,
		smarttabs: true,
		node: true,
		boss: true
	},

	/**
	 * Lint 'data'
	 * @param {String} data
	 * @param {Function} fn(err)
	 */
	lint: function(data, fn) {
		var result = jshint(data, exports.options, {});
		if (!result) {
			var items = jshint.errors.map(function(error) {
				if (error) {
					return {
						line: error.line,
						col: error.character,
						reason: error.reason,
						evidence: (error.evidence != null)
							? error.evidence.replace(RE_TRIM, '')
							: null
					};
				} else {
					return null;
				}
			});
			fn({items: items});
		}
	}
};
