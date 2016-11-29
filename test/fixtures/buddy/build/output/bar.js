'use strict';

/** BUDDY BUILT **/

if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = { env: {} };
var $m = self.$m = self.$m || {};
if ('browser' != 'browser') {
  var $req = require;
  require = function buddyRequire (id) {
    if (!$m[id]) return $req(id);
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  };
} else {
  self.require = self.require || function buddyRequire (id) {
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
/*== foo.js ==*/
$m['foo'] = { exports: {} };
$m['foo'].exports = 'foo';
/*≠≠ foo.js ≠≠*/


/*== bar.js ==*/
$m['bar'] = { exports: {} };
var bar__foo = $m['foo'].exports;

$m['bar'].exports = bar__foo;
/*≠≠ bar.js ≠≠*/
})()


//# sourceMappingURL=bar.js.map