'use strict';

// TODO: error handling

var escape = require('../utils/reEscape.js')
	, fs = require('fs')
	, inlineRun = require('inline-source/lib/run')
	, path = require('path')

	, RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

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
	var inlineContent;

	references.forEach(function (reference) {
		inlineContent = '';
		// Handle disabled
		if (reference.isDisabled) {
			inlineContent = '{}';
		// Inline json
		} else if (reference.instance.extension == 'json') {
			inlineContent = reference.instance.content || '{}';
		}
		// Replace require(*) with inlined content
		if (inlineContent) content = content.replace(new RegExp(escape(reference.match), 'mg'), inlineContent);
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
	function inline (inlineContent, inlineReferences) {
		var inlined;

		inlineReferences.forEach(function (reference) {
			// Inline nested dependencies
			// Duplicates are allowed (not @import_once)
			inlined = reference.instance.dependencyReferences.length
				? inline(reference.instance.content, reference.instance.dependencyReferences)
				: reference.instance.content;
			// Replace @import with inlined content
			inlineContent = inlineContent.replace(new RegExp(escape(reference.match), 'mg'), inlined);
		});

		return inlineContent;
	}

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
	// Find references acquired via inline-source
	var sources = references.filter(function (reference) {
		return reference.stack != null;
	});

	if (sources.length) {
		// Update transformed html content
		var context = sources[0].parentContext;

		context.html = content;
		// Defer to inline-source
		inlineRun(context, sources, false, fn);
	} else {
		fn(null, content);
	}
}