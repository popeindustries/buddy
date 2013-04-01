require.register('package/classcamelcase', function(module, exports, require) {
  var ClassCamelCase = function() {
  	this.someVar = 'hey';
  };
  
  ClassCamelCase.prototype.someFunc = function () {
  	console.log(this.someVar);
  };
  
  module.exports = ClassCamelCase;
});
require.register('main', function(module, exports, require) {
  var ClassCamelCase = require('./package/classcamelcase');
  
  var ccc = new ClassCamelCase();
  var arr = [1,2,3,4,5];
  
  for (var i = 0, n = arr.length; i < n; i++) {
  	var item = arr[i];
  	item++;
  	if (item > 2) {
  		console.log('item is really big', item);
  	}
  }
  
});