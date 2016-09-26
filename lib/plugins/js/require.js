if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = {env:{}};
if (!self.$m) self.$m = {};
if (!self.require) {
  self.require = function require (id) {
    if ($m[id]) {
      if ($m[id].__b__) $m[id]();
      return $m[id];
    }

    if (process.env.NODE_ENV == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}