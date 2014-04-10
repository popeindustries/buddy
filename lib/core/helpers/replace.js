var Promise = require('bluebird')
	, escape = require('../../utils/reEscape.js');

/**
 * Replace all relative dependency id's with fully resolved in 'file' content
 * @param {String} content
 * @param {Array} references
 * @returns {Promise(content)}
 */
module.exports = Promise.method(function (content, references) {
	references.forEach(function (reference) {
		if (reference.filepath.charAt(0) == '.') {
			content = content.replace(new RegExp(escape(reference.filepath), 'gm'), reference.instance.id);
		}
	});

	return content;
});