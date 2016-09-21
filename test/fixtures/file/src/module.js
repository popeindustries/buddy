'use strict';

module.exports = function foo () {};

exports.foo = 'foo';
exports['foo'] = 'foo';

module['exports'] = {};
module['ex' + 'ports'] = {};