// TODO: error handling

var escape = require('../../utils/reEscape.js')
	, fs = require('fs')
	, inlineSource = require('inline-source')
	, path = require('path')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm
	, RE_JSON = /\.json$/;

/**
 * Inline all inlineable dependency 'references'
 * @param {String} filepath
 * @param {String} type
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
module.exports = function (filepath, type, content, references) {
	if (type == 'js') {
		return inlineJS(filepath, content, references);
	} else if (type == 'css') {
		return inlineCSS(content, references);
	} else {
		return inlineSource.inline(references, content, {compress: false});
	}
};

/**
 * Inline JS json content
 * @param {String} filepath
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineJS (filepath, content, references) {
	var json;

	references.forEach(function (reference) {
		// Inline json
		if (path.extname(reference.instance.filepath) == '.json') {
			json = getJSON(reference.instance.filepath);
			// Replace require(*) with inlined json
			content = content.replace(new RegExp(escape(reference.context), 'mg'), json);
		}
	});

	return content;
}

/**
 * Inline CSS @import content
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineCSS (content, references) {
	function inline (content, references) {
		var inlineContent;

		references.forEach(function (reference) {
			// Inline nested dependencies
			// Duplicates are allowed (not @import_once)
			inlineContent = reference.instance.dependencyReferences.length
				? inline(reference.instance.content, reference.instance.dependencyReferences)
				: reference.instance.content;
			// Replace @import with inlined content
			content = content.replace(new RegExp(escape(reference.context), 'mg'), inlineContent);
		});

		return content;
	};

	// Remove comments
	// Less/Stylus? leaves comments behind after processing
	content = inline(content, references)
		.replace(RE_CSS_COMMENT_LINES, '');

	return content;
}

/**
 * Load and parse json
 * @param {String} filepath
 * @returns {String}
 */
function getJSON (filepath) {
	var json = fs.existsSync(filepath)
			? fs.readFileSync(filepath, 'utf8')
			: '{}';

	// Validate by converting to/from object
	try {
		json = JSON.stringify(JSON.parse(json));
	} catch (err) {
		json = '{}';
	}

	return json;
}