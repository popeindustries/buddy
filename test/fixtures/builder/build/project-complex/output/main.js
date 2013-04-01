require.register('utils/util', function(module, exports, require) {
  module.exports = 'some util';
  
});
require.register('main', function(module, exports, require) {
  var item, util, _i, _len, _ref;
  
  util = require('./utils/util');
  
  _ref = [1, 2, 3, 4, 5];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    item = _ref[_i];
    item++;
    if (item > 2) {
      console.log('item is really big', item);
    }
  }
  
});