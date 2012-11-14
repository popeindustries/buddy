/*BUILT Wed Nov 14 2012 20:55:39 GMT+0100 (CET)*/
(function () {
  var ___hasProp = {}.hasOwnProperty;
  var ___extends = function(child, parent) { for (var key in parent) { if (___hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
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
      __hasProp = ___hasProp,
      __extends = ___extends;
    
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
  require.register('main', function(module, exports, require) {
    var ClassCamelCase, ccc, item, _i, _len, _ref;
    
    ClassCamelCase = require('./package/classcamelcase');
    
    ccc = new ClassCamelCase;
    
    _ref = [1, 2, 3, 4, 5];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item++;
      if (item > 2) {
        console.log('item is really big', item);
      }
    }
    
  });
}).call(this);