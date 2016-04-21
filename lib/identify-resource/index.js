'use strict';

var cache = require('./cache')
	, identify = require('./identify')
	, resolve = require('./resolve');

exports.identify = identify;
exports.resolve = resolve;
exports.hasMultipleVersions = cache.hasMultipleVersions;
exports.clearCache = cache.clear;