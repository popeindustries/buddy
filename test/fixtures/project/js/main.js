/*BUILT Sun Nov 20 2011 11:58:38 GMT+0100 (CET)*/


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

require.module('nested/nested', function(module, exports, require) {
  var Nested;
  return module.exports = Nested = (function() {

    function Nested() {
      this.someVar = 'hey';
    }

    Nested.prototype.someFunc = function() {
      return console.log(this.someVar);
    };

    return Nested;

  })();
});

require.module('main', function(module, exports, require) {
  var Nested, item, nested, _i, _len, _ref, _results;
  Nested = require('./nested/nested');
  nested = new Nested;
  _ref = [1, 2, 3, 4, 5];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    item = _ref[_i];
    item++;
    if (item > 2) {
      _results.push(console.log('item is really big', item));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
});
