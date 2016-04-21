if (window._m_ == null) window._m_ = {};
if (window.require == null) {
  window.require = function require (id) {
    if (!_m_[id]) return;
    return (_m_[id].exports == null) ? _m_[id]() : _m_[id];
  };
}