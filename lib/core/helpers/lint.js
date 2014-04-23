var eslint = require('eslint')
	, eslintConf = require('eslint/lib/config')
	, csslint = require('csslint').CSSLint
	, extend = require('lodash').extend

	, ESLINT_CONFIG = {
			global: [
				'require:false',
				'module:true',
				'exports:true'
			],
			env: [
				'browser'
			]
		}
	, RE_TRIM = /^\s+|\s+$/

	, jsConfig = new eslintConf(ESLINT_CONFIG).getConfig();

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
 * Lint js 'content'
 * @param {String} content
 * @param {Object} options
 */
function lintJS (content, options) {
	var result = eslint.linter.verify(content, jsConfig);

	if (result.length) {
		var items = result.map(function (error) {
			return {
				line: error.line,
				col: error.column,
				reason: error.message,
				evidence: (error.source != null)
					? error.source.replace(RE_TRIM, '')
					: null
			};
		});
		return items;
	} else {
		return null;
	}
}

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