/*BUILT Fri Dec 02 2011 11:58:31 GMT+0100 (CET)*/
(function () {
  
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
    window.require = require;
    return window.module = require.module;
  })();
  
  
  
  require.module('package/prewrapped', function(module, exports, require) {
    var me = 'a prewrapped module';
  });
  
  require.module('main_wrapped', function(module, exports, require) {
    var wrapped = require('package/prewrapped');
    
    for (var i = 0, n = arr.length; i < n; i++) {
      var item = arr[i];
      item++;
      if (item > 2) {
        console.log('item is really big', item);
      }
    }
    
  });
  
  require('main_wrapped');
  
  
  
}).call(this);