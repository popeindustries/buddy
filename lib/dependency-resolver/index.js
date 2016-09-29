'use strict';

const { clear, hasMultipleVersions } = require('./cache');

exports.identify = require('./identify');
exports.resolve = require('./resolve');
exports.nativeModules = require('./nativeModules');
exports.hasMultipleVersions = hasMultipleVersions;
exports.clearCache = clear;