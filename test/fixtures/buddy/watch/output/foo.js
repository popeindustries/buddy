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

  if ('dev' == 'development') {
    console.warn('module ' + id + ' not found');
  }
};

(function () {
/*== foo.js ==*/
$m['foo'] = { exports: {} };
"use strict";

var foo__foo = "foo";
/*≠≠ foo.js ≠≠*/
})()