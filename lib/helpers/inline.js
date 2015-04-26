'use strict';

// TODO: error handling

var escape = require('../utils/reEscape.js')
	, fs = require('fs')
	, inlineRun = require('inline-source/lib/run')
	, path = require('path')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm
	, RE_JSON = /\.json$/;

/**
 * Inline all inlineable dependency 'references'
 * @param {String} type
 * @param {String} content
 * @param {Array} references
 * @param {Function} fn(err, content)
 */
module.exports = function (type, content, references, fn) {
	if (type == 'js') {
		fn(null, inlineJS(content, references));
	} else if (type == 'css') {
		fn(null, inlineCSS(content, references));
	} else {
		inlineHTML(content, references, fn);
	}
};

/**
 * Inline JS json content
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineJS (content, references) {
	var json;

	references.forEach(function (reference) {
		// Inline json
		if (path.extname(reference.instance.filepath) == '.json') {
			json = getJSON(reference.instance.filepath);
			// Replace require(*) with inlined json
			content = content.replace(new RegExp(escape(reference.match), 'mg'), json);
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
			content = content.replace(new RegExp(escape(reference.match), 'mg'), inlineContent);
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
 * Inline HTML content
 * @param {String} content
 * @param {Array} references
 * @param {Function} fn(err, content)
 */
function inlineHTML (content, references, fn) {
	var sources = references.filter(function (reference) {
		return reference.stack != null;
	});

	if (sources.length) {
		// Update transformed html content
		var context = sources[0].parentContext;
		context.html = content;
		inlineRun(context, sources, false, fn);
	} else {
		fn(null, content);
	}
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
