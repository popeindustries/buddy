var indent = require('../../utils/cnsl').indent;

var RE_MODULE = /require\.register[\s|\(].+(?:function)? *\( *module *, *exports *, *require *\)/gm
	, RE_MODULE_LAZY = /require\.register[\s|\(].+\)?/gm;

/**
 * Wrap 'file' content in module definition if not already wrapped
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function (file, options, fn) {
	var content = file.content
		, re = options.lazy
			? RE_MODULE_LAZY
			: RE_MODULE;

	re.lastIndex = 0; // Reset
	if (!re.test(content)) {
		if (options.lazy) {
			content = "require.register('"
				+ file.id
				+ "', "
				+ content
				+ ");";
		} else {
			content = "require.register('"
				+ file.id
				+ "', function(module, exports, require) {\n"
				+ (indent(content, 2))
				+ "\n});";
		}
	}
	file.content = content;

	return fn(null, file);
};
