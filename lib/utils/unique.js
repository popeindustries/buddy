var escape = require('./reEscape.js')
	, fs = require('fs')
	, md5 = require('MD5')
	, path = require('path')

	, RE_UNIQUE = /%(?:hash|date)%/
	, PLACEHOLDER = '____';

/**
 * Find file matching 'pattern'
 * @param {String} pattern
 * @returns {String}
 */
exports.find = function (pattern) {
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
 * @param {String} pattern
 * @param {String|Boolean} content
 * @returns {String}
 */
exports.generate = function (pattern, content) {
	pattern = path.resolve(pattern);

	var re_unique, wildcard;

	if (re_unique = RE_UNIQUE.exec(pattern)) {
		wildcard = re_unique[0];
		if (wildcard == '%hash%') {
			// Remove if content == false
			pattern = pattern.replace(wildcard, (content ? md5(content) : ''));
		} else if (wildcard == '%date%') {
			pattern = pattern.replace(wildcard, (content ? Date.now() : ''));
		}
	}

	return pattern;
};

/**
 * Determine whether 'pattern' is supported
 * @param {String} pattern
 * @returns {Boolean}
 */
exports.isUniquePattern = function (pattern) {
	return RE_UNIQUE.test(pattern);
};