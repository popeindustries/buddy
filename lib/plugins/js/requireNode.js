var $m = {};
var originalRequire = require;
require = function buddyRequire (id) {
  if (!$m[id]) return originalRequire(id);
  if ($m[id].__b__) $m[id]();
  return $m[id];
};