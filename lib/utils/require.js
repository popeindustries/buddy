if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if (self._m_ == null) self._m_ = {};
if (self.require == null) {
  self.require = function require (id) {
    if (!_m_[id]) return;
    return (_m_[id].boot) ? _m_[id]() : _m_[id];
  };
}