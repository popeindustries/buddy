'use strict';

var path = require('path');

/**
 * Determine type of 'filepath'
 * @param {String} filepath
 * @param {Boolean} isRoot
 * @param {String} rootType
 * @param {Object} fileExtensions
 * @param {String}
 */
module.exports = function type (filepath, fileExtensions) {
	var ext = path.extname(filepath).slice(1);

	// Match input extension to type
	for (var type in fileExtensions) {
		var exts = fileExtensions[type];
		for (var i = 0, n = exts.length; i < n; i++) {
			if (ext == exts[i]) return type;
		}
	}
};