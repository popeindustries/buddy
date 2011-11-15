var CSSTarget, JSTarget, Target, log;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

log = console.log;

exports.Target = Target = (function() {

  function Target(input, output) {
    this.input = input;
    this.output = output;
  }

  Target.prototype._parseInputs = function(input) {};

  return Target;

})();

exports.JSTarget = JSTarget = (function() {

  __extends(JSTarget, Target);

  JSTarget.prototype.sources = [];

  function JSTarget(input, output) {
    JSTarget.__super__.constructor.call(this, input, output);
  }

  return JSTarget;

})();

exports.CSSTarget = CSSTarget = (function() {

  __extends(CSSTarget, Target);

  CSSTarget.prototype.sources = [];

  function CSSTarget() {}

  return CSSTarget;

})();
