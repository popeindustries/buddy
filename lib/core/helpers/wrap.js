var indent = require('../../utils/cnsl').indent

	, RE_WRAPPED = /require\.register\(/;

/**
 * Wrap 'content' in module definition
 * @param {String} id
 * @param {String} content
 * @param {Boolean} lazy
 * @returns {String}
 */
module.exports = function (id, content, lazy) {
	// Reset regex
	RE_WRAPPED.lastIndex = 0;

	// Don't wrap if already wrapped
	if (!RE_WRAPPED.test(content)) {
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