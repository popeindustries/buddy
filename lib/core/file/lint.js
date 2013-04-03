var jshint = require('jshint').JSHINT
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
 * Lint 'file' content
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	(file.type == 'js')
		? lintJS(file, extend(JS_DEFAULTS, options), fn)
		: lintCSS(file, options, fn);
};

/**
 * Lint css 'file' content
 * @param {File} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
function lintCSS (file, options, fn) {
	var result = csslint.verify(file.content);
	if (result.messages.length) {
		var items = result.messages.map(function(error) {
			return {
				line: error.line,
				col: error.col,
				reason: error.message,
				evidence: (error.evidence != null)
					? error.evidence.replace(RE_TRIM, '')
					: null
			};
		});
		fn({items: items}, file);
	} else {
		fn(null, file);
	}
}

/**
 * Lint js 'file' content
 * @param {File} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
function lintJS (file, options, fn) {
	var result = jshint(file.content, options, {});
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
		fn({items: items}, file);
	} else {
		fn(null, file);
	}
}