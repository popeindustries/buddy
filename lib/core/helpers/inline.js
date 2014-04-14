// TODO: error handling

var Promise = require('bluebird')
	, fs = require('fs')
	, path = require('path')
	, inlineSource = require('inline-source')
	, escape = require('../../utils/reEscape.js')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm
	, RE_JSON = /\.json$/;

/**
 * Inline all inlineable dependency 'references'
 * @param {String} filepath
 * @param {String} type
 * @param {String} content
 * @param {Array} references
 * @returns {Promise(content)}
 */
module.exports = Promise.method(function (filepath, type, content, references) {
	switch (type) {
		case 'js':
			return inlineJS(filepath, content, references);
		case 'css':
			return inlineCSS(content, references);
		case 'html':
			return inlineSource(filepath, content);
	}
});

/**
 * Inline JS json content
 * @param {String} filepath
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineJS (filepath, content, references) {
	var jsonpath, json;

	references.forEach(function (reference) {
		// Inline json
		if (RE_JSON.test(reference.filepath)) {
			jsonpath = path.resolve(path.dirname(filepath), reference.filepath);
			json = getJSON(jsonpath);
			// Replace require(*) with inlined json
			content = content.replace(new RegExp(escape(reference.context), 'mg'), json);
		}
	});

	return Promise.resolve(content);
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
				? inline(reference.instance.conent, reference.instance.dependencyReferences)
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

	return Promise.resolve(content);
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