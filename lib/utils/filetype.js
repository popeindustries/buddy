'use strict';

var path = require('path');

/**
 * Determine type of 'filepath'
 * @param {String} filepath
 * @param {Object} fileExtensions
 * @returns {String}
 */
module.exports = function type (filepath, fileExtensions) {
	var ext = path.extname(filepath).slice(1);

	// Match input extension to type
	for (var t in fileExtensions) {
		var exts = fileExtensions[t];

		for (var i = 0, n = exts.length; i < n; i++) {
			if (ext == exts[i]) return t;
		}
	}

	return 'unknown';
};