'use strict';

var intersection = require('lodash/array/intersection')
	, path = require('path');

/**
 * Determine type of 'filepath'
 * @param {String} filepath
 * @param {Boolean} isRoot
 * @param {String} rootType
 * @param {Object} fileExtensions
 * @param {String}
 */
module.exports = function type (filepath, isRoot, rootType, fileExtensions) {
	fileExtensions = fileExtensions || {
		js: [],
		html: []
	};

	var ext = path.extname(Array.isArray(filepath)
				? filepath[0]
				: filepath
			).slice(1)
		, mixed = intersection(fileExtensions.js, fileExtensions.html)
		, isMixed = ~mixed.indexOf(ext);

	// Html templates can be both html or js
	if (isMixed) {
		if (isRoot) return 'html';
		return rootType;
	}

	// Match input extension to type
	for (var type in fileExtensions) {
		var exts = fileExtensions[type];
		for (var i = 0, n = exts.length; i < n; i++) {
			if (ext == exts[i]) {
				return type;
			}
		}
	}
};