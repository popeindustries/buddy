/*BUILT Sun Nov 20 2011 12:24:43 GMT+0100 (CET)*/


(function() {
  var require;
  require = function(path) {
    var m;
    m = require.modules[path] || require.modules[path += '/index'];
    if (!m) throw "Couldn't find module for: " + path;
    if (!m.exports) {
      m.exports = {};
      m.call(m.exports, m, m.exports, require.bind(path));
    }
    return m.exports;
  };
  require.modules = {};
  require.bind = function(path) {
    return function(p) {
      var part, paths, _i, _len, _ref;
      if (p.charAt(0) !== '.') return require(p);
      paths = path.split('/');
      paths.pop();
      _ref = p.split('/');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        part = _ref[_i];
        if (part === '..') {
          paths.pop();
        } else if (part !== '.') {
          paths.push(part);
        }
      }
      return require(paths.join('/'));
    };
  };
  require.module = function(path, fn) {
    return require.modules[path] = fn;
  };
  return window.require = require;
})();
;

var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

require.module('other/class', function(module, exports, require) {
  var Class;
  return module.exports = Class = (function() {

    function Class() {
      this.someVar = 'hey';
    }

    Class.prototype.someFunc = function() {
      return console.log(this.someVar);
    };

    return Class;

  })();
});

require.module('other/class_camel_case', function(module, exports, require) {
  var Class, ClassCamelCase;
  Class = require('./class');
  return module.exports = ClassCamelCase = (function() {

    __extends(ClassCamelCase, Class);

    function ClassCamelCase() {
      this.someVar = 'hey';
    }

    ClassCamelCase.prototype.someFunc = function() {
      return console.log(this.someVar);
    };

    return ClassCamelCase;

  })();
});
