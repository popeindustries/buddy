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
require.register('package/classcamelcase', function(module, exports, require) {
  var Class, ClassCamelCase,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
  
  Class = require('./class');
  
  module.exports = ClassCamelCase = (function(_super) {
    __extends(ClassCamelCase, _super);
  
    function ClassCamelCase() {
      this.someVar = 'hey';
    }
  
    ClassCamelCase.prototype.someFunc = function() {
      return console.log(this.someVar);
    };
  
    return ClassCamelCase;
  
  })(Class);
  
});