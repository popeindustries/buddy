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
$m['b.js'].exports = _bjs_b;

var _bjs_a = require('a.js');

function _bjs_b() {
  console.log('b');
}
};
/*≠≠ b.js ≠≠*/

/*== a.js ==*/
$m['a.js'] = function () {
$m['a.js'] = { exports: {} };
$m['a.js'].exports = _ajs_a;

var _ajs_b = require('b.js');

function _ajs_a() {
  console.log('a');
}
};
/*≠≠ a.js ≠≠*/

/*== wrapped.js ==*/
$m['wrapped.js'] = { exports: {} };
var _wrappedjs_a = require('a.js');
/*≠≠ wrapped.js ≠≠*/
})()