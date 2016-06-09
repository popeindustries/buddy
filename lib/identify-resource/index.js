'use strict';

const cache = require('./cache');
const identify = require('./identify');
const resolve = require('./resolve');

exports.identify = identify;
exports.resolve = resolve;
exports.hasMultipleVersions = cache.hasMultipleVersions;
exports.clearCache = cache.clear;