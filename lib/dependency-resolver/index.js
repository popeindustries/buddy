'use strict';

const { clear, hasMultipleFileVersions } = require('./cache');

exports.identify = require('./identify');
exports.resolve = require('./resolve');
exports.nativeModules = require('./nativeModules');
exports.hasMultipleFileVersions = hasMultipleFileVersions;
exports.clearCache = clear;