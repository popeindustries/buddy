/*BUILT Tue Nov 22 2011 11:07:50 GMT+0100 (CET)*/


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

require.module('utils/util', function(module, exports, require) {
  return module.exports = 'some util';
});

require.module('section/section', function(module, exports, require) {
  var Section, util;
  util = require('utils/util');
  return module.exports = Section = (function() {

    function Section() {
      this.someVar = 'hey';
    }

    Section.prototype.someFunc = function() {
      return console.log(this.someVar);
    };

    return Section;

  })();
});

require.module('section/some_section', function(module, exports, require) {
  var Section, section, util;
  Section = require('./section');
  util = require('utils/util');
  return section = new Section;
});
