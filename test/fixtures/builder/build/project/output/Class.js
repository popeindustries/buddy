require.register('package/class', function(module, exports, require) {
  var Class;
  
  module.exports = Class = (function() {
    function Class() {
      this.someVar = 'hey';
    }
  
    Class.prototype.someFunc = function() {
      return console.log(this.someVar);
    };
  
    return Class;
  
  })();
  
});