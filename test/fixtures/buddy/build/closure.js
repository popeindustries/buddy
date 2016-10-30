;(function (root, factory) {
  if (typeof exports === "object") {
    module.exports = factory.call(root);
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.ol = factory();
  }
}(window, function () {
}));