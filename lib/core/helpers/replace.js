var Promise = require('bluebird')
	, escape = require('../../utils/reEscape.js');

/**
 * Replace all dependency id's in 'content' with fully resolved
 * @param {String} content
 * @param {Array} references
 * @returns {Promise(content)}
 */
module.exports = Promise.method(function (content, references) {
	var context;

	references.forEach(function (reference) {
		if (reference.instance && reference.filepath != reference.instance.id) {
			context = reference.context.replace(reference.filepath, reference.instance.id);
			// Create new RegExp so that flags work properly
			content = content.replace(new RegExp(escape(reference.context), 'gm'), context);
		}
	});

	return content;
});