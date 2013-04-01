require.register('package/prewrapped', function(module, exports, require) {
  require.module('package/prewrapped', function(module, exports, require) {
  	var me = 'a prewrapped module';
  });
});
require.register('mainwrapped', function(module, exports, require) {
  var wrapped = require('package/prewrapped');
  
  for (var i = 0, n = arr.length; i < n; i++) {
  	var item = arr[i];
  	item++;
  	if (item > 2) {
  		console.log('item is really big', item);
  	}
  }
  
});