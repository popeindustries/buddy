var jshint = require('jshint').JSHINT
	, csslint = require('csslint').CSSLint
	, extend = require('lodash').extend

	, RE_TRIM = /^\s+|\s+$/;


/**
 * Lint 'content'
 * @param {String} type
 * @param {String} content
 * @returns {Array}
 */
module.exports = function (type, content) {
	return (type == 'js')
		? lintJS(content)
		: lintCSS(content);
};

/**
 * Lint css 'content'
 * @param {String} content
 * @returns {Object}
 */
function lintCSS (content) {
	var result = csslint.verify(content);
	if (result.messages.length) {
		var items = result.messages.map(function (error) {
			return {
				line: error.line,
				col: error.col,
				reason: error.message,
				evidence: (error.evidence != null)
					? error.evidence.replace(RE_TRIM, '')
					: null
			};
		});
		return items;
	} else {
		return null;
	}
}

/**
 * Lint js 'content'
 * @param {String} content
 * @param {Object} options
 */
function lintJS (content, options) {
	var result = jshint(content, options, {});
	if (!result) {
		var items = jshint.errors.map(function(error) {
			if (error) {
				return {
					line: error.line,
					col: error.character,
					reason: error.reason,
					evidence: (error.evidence != null)
						? error.evidence.replace(RE_TRIM, '')
						: null
				};
			} else {
				return null;
			}
		});
		return items;
	} else {
		return null;
	}
}