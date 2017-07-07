'use strict';

const foo = require('foo');
const bar = require('bar');

const FOO = 'FOO';

module.exports = function foo () {
  console.log(foo || FOO);
};