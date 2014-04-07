var Promise = require('bluebird')
	, indent = require('../../utils/cnsl').indent

	, RE_MODULE = /require\.register[\s|\(].+(?:function)? *\( *module *, *exports *, *require *\)/gm
	, RE_MODULE_LAZY = /require\.register[\s|\(].+\)?/gm;

/**
 * Wrap 'content' in module definition
 * @param {String} id
 * @param {String} content
 * @param {Boolean} lazy
 * @returns {Promise}
 */
module.exports = Promise.method(function (id, content, lazy) {
	var re = lazy
		? RE_MODULE_LAZY
		: RE_MODULE;

	// Reset regex
	re.lastIndex = 0;

	if (!re.test(content)) {
		if (lazy) {
			content = "require.register('"
				+ id
				+ "', "
				+ content
				+ ");";
		} else {
			content = "require.register('"
				+ id
				+ "', function(module, exports, require) {\n"
				+ (indent(content, 2))
				+ "\n});";
		}
	}

	return content;
});