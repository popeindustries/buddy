var Promise = require('bluebird')
	, jshint = require('jshint').JSHINT
	, csslint = require('csslint').CSSLint
	, extend = require('lodash').extend

	, RE_TRIM = /^\s+|\s+$/
	, JS_DEFAULTS = {
		curly: true,
		eqeqeq: false,
		immed: true,
		latedef: true,
		newcap: true,
		noarg: true,
		undef: true,
		unused: true,
		eqnull: true,
		es5: false,
		esnext: false,
		bitwise: true,
		strict: false,
		trailing: false,
		smarttabs: true,
		laxcomma: true,
		node: true,
		boss: true
	};


/**
 * Lint 'content'
 * @param {String} type
 * @param {String} content
 * @returns {Promise}
 */
module.exports = Promise.method(function (type, content) {
	return (type == 'js')
		? lintJS(content, JS_DEFAULTS)
		: lintCSS(content);
});

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
		return {warnings: items};
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
		return {warnings: items};
	} else {
		return null;
	}
}