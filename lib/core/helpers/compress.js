var uglify = require('uglify-js')
	, csso = require('csso');

/**
 * Compress 'content'
 * @param {String} type
 * @param {String} content
 * @returns {String}
 */
module.exports = function (type, content) {
	if (type == 'js') {
		content = uglify.minify(content, {fromString: true}).code;
	} else if (type == 'css') {
		content = csso.justDoIt(content);
	}

	return content;
};