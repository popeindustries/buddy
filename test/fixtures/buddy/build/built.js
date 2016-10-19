/** BUDDY BUILT **/
if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = { env: {} };
var $m = self.$m = self.$m || {};
var require = self.require || function require (id) {
  if ($m[id]) {
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  }

  if ('test' == 'development') {
    console.warn('module ' + id + ' not found');
  }
};
!(function () {
/*== b.js ==*/
$m['b.js'] = function () {
$m['b.js'] = { exports: {} };
$m['b.js'].exports = bjs__b;

var bjs__a = require('a.js');

function bjs__b() {
  console.log('b');
}
};
/*≠≠ b.js ≠≠*/

/*== a.js ==*/
$m['a.js'] = function () {
$m['a.js'] = { exports: {} };
$m['a.js'].exports = ajs__a;

var ajs__b = require('b.js');

function ajs__a() {
  console.log('a');
}
};
/*≠≠ a.js ≠≠*/

/*== circular.js ==*/
$m['circular.js'] = { exports: {} };
var circularjs__a = require('a.js');
/*≠≠ circular.js ≠≠*/
})()