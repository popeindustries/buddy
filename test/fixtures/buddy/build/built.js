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
$m['b'].exports = b__b;

var b__a = require('a');

function b__b() {
  console.log('b');
}
};
/*≠≠ b.js ≠≠*/

/*== a.js ==*/
$m['a'] = function () {
$m['a'] = { exports: {} };
$m['a'].exports = a__a;

var a__b = require('b');

function a__a() {
  console.log('a');
}
};
/*≠≠ a.js ≠≠*/

/*== circular.js ==*/
$m['circular'] = { exports: {} };
var circular__a = require('a');
/*≠≠ circular.js ≠≠*/
})()