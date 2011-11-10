var CSSTarget, JSTarget, Target;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

exports.Target = Target = (function() {

  function Target() {}

  return Target;

})();

exports.JSTarget = JSTarget = (function() {

  __extends(JSTarget, Target);

  function JSTarget() {}

  return JSTarget;

})();

exports.CSSTarget = CSSTarget = (function() {

  __extends(CSSTarget, Target);

  function CSSTarget() {}

  return CSSTarget;

})();
