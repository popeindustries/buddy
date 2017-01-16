if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
var $m = self.$m = self.$m || {};
if (process.env.RUNTIME != 'browser') {
  var $req = require;
  require = function buddyRequire (id) {
    if (!$m[id]) return $req(id);
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  };
} else {
  if ('undefined' === typeof process) var process = {browser:process.browser, env:{NODE_ENV:process.env.NODE_ENV}};
  self.require = self.require || function buddyRequire (id) {
    if ($m[id]) {
      if ('function' == typeof $m[id]) $m[id]();
      return $m[id].exports;
    }

    if (process.env.NODE_ENV == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}