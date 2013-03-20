var indent = require('buddy-term').indent;

var RE_MODULE = /require\.register[\s|\(].+(?:function)? *\( *module *, *exports *, *require *\)/gm
	, RE_MODULE_LAZY = /require\.register[\s|\(].+\)?/gm;

/**
 * Wrap 'content' in module definition if not already wrapped
 * @param {String} id
 * @param {String} content
 * @param {Boolean} lazy
 * @return {String}
 */
module.exports = function(id, content, lazy) {
	if (lazy == null) lazy = false;
	var re = lazy
		? RE_MODULE_LAZY
		: RE_MODULE;
	re.lastIndex = 0; // Reset
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
};
