'use strict';

const { VERSION_DELIMITER } = require('./config');

exports.identify = require('./identify');
exports.resolve = require('./resolve');
exports.cache = require('./cache');
exports.VERSION_DELIMITER = VERSION_DELIMITER;