var fs = require('fs')
	, path = require('path')
	, md5 = require('MD5')
	, escape = require('./reEscape.js')

	, RE_UNIQUE = /{(?:hash|date)}/
	, PLACEHOLDER = '____';

/**
 * Find file matching 'pattern'
 * @param {String} pattern
 * @returns {String}
 */
exports.find = function findUnique (pattern) {
	pattern = path.resolve(pattern);

	// Limit scope to containing directory
	var dir = path.dirname(pattern)
		, re_unique;

	// Matches {hash} or {date}
	if (re_unique = RE_UNIQUE.exec(pattern)) {
		try {
			var files = fs.readdirSync(dir)
		} catch (err) {
			// Directory doesn't exist
			return '';
		}

		// Generate regexp with pattern as wildcard
		var re = new RegExp(escape(pattern.replace(re_unique[0], PLACEHOLDER)).replace(PLACEHOLDER, '(.+)'))
			, file;

		for (var i = 0, n = files.length; i < n; i++) {
			file = path.resolve(dir, files[i]);
			if (re.test(file)) return file;
		}
	}

	return '';
};

/**
 * Generate unique filepath from 'pattern'
 */
exports.generate = function generateUnique (pattern, content) {
	pattern = path.resolve(pattern);

	var re_unique, wildcard;

	if (re_unique = RE_UNIQUE.exec(pattern)) {
		wildcard = re_unique[0];
		if (wildcard == '{hash}' && content) {
			pattern = pattern.replace(wildcard, md5(content));
		} else if (wildcard == '{date}') {
			pattern = pattern.replace(wildcard, Date.now());
		}
	}

	return pattern;
};

/**
 * Determine whether 'pattern' is supported
 * @param {String} pattern
 * @returns {Boolean}
 */
exports.isUniquePattern = function isUniquePattern (pattern) {
	return RE_UNIQUE.test(pattern);
};