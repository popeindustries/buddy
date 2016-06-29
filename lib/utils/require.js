if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = {env:{}};
if (self._m_ == null) self._m_ = {};
if (self.require == null) {
  self.require = function require (id) {
    if (_m_[id]) return (_m_[id].boot) ? _m_[id]() : _m_[id];

    if (process.env.NODE_ENV == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}