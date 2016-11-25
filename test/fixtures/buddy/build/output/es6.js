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


(function (global) {
  var babelHelpers = global.babelHelpers = {};

  babelHelpers.interopRequireWildcard = function (obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  };
})(typeof global === "undefined" ? self : global);

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


/*== es6.js ==*/
$m['es6'] = { exports: {} };
$m['es6'].exports.__esModule = true;

$m['es6'].exports.default = function () {
  console.log(foo);
  console.log(barDefault);
  console.log(es6__batModule.default, es6__batModule.bat);
};

var es6___bat = require('./bat');

var es6__batModule = babelHelpers.interopRequireWildcard(es6___bat);
$m['foo'].exports;
$m['bar'].exports;
;
/*≠≠ es6.js ≠≠*/
})()