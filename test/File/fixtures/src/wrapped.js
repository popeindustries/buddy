/** BUDDY BUILT **/
var $req = require;
var isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
var isBrowser = typeof window !== 'undefined';
var isWorker = !isNode && !isBrowser;
if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = { env: {} };
var $m = self.$m = self.$m || {};
if ('browser' != 'browser') {
  require = function buddyRequire (id) {
    if (!$m[id]) return $req(id);
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  };
} else {
  var require = self.require || function require (id) {
    if ($m[id]) {
      if ('function' == typeof $m[id]) $m[id]();
      return $m[id].exports;
    }

    if ('test' == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}


(function () {
/*== b.js ==*/
$m['b'] = function () {
$m['b'] = { exports: {} };
$m['b'].exports = _b_b;

var _b_a = require('a');

function _b_b() {
  console.log('b');
}
};
/*≠≠ b.js ≠≠*/

/*== a.js ==*/
$m['a'] = function () {
$m['a'] = { exports: {} };
$m['a'].exports = _a_a;

var _a_b = require('b');

function _a_a() {
  console.log('a');
}
};
/*≠≠ a.js ≠≠*/

/*== wrapped.js ==*/
$m['wrapped'] = { exports: {} };
var _wrapped_a = require('a');
/*≠≠ wrapped.js ≠≠*/
})()