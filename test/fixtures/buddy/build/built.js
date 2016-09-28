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
/*== built.js ==*/
$m['built.js'] = { exports: {} };
$m['built.js'].exports = 'built';
/*≠≠ built.js ≠≠*/
})()