module.exports = {};
module['exports'] = {};
module['ex' + 'ports'] = {};

exports.foo = 'foo';
exports['foo'] = 'foo';
exports.BELL = '\x07';

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

if (true) {
  const module = 'foo';
  const exports = 'bar';

  exports.foo = 'foo';
}
foo[exports.foo] = 'foo';