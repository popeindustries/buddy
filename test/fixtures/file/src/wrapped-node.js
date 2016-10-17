/** BUDDY BUILT **/
var $m = {};
var originalRequire = require;
require = function buddyRequire (id) {
  if (!$m[id]) return originalRequire(id);
  if ('function' == typeof $m[id]) $m[id]();
  return $m[id].exports;
};
/*== k.js ==*/
$m['k.js'] = function () {
$m['k.js'] = { exports: {} };
var _kjs_i = require('i.js');
};
/*≠≠ k.js ≠≠*/

/*== j.js ==*/
$m['j.js'] = function () {
$m['j.js'] = { exports: {} };
var _jjs_k = require('k.js');
};
/*≠≠ j.js ≠≠*/

/*== i.js ==*/
$m['i.js'] = function () {
$m['i.js'] = { exports: {} };
var _ijs_j = require('j.js');
};
/*≠≠ i.js ≠≠*/

/*== circular-complex.js ==*/
$m['circular-complex.js'] = { exports: {} };
var _circularcomplexjs_i = require('i.js');
/*≠≠ circular-complex.js ≠≠*/