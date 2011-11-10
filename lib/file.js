var CSSFile, File, JSFile;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

exports.File = File = (function() {

  function File(filepath, filename, name, contents) {
    this.filepath = filepath;
    this.filename = filename;
    this.name = name;
    this.contents = contents;
    ({
      updateContents: function(contents) {
        return this.contents = contents;
      }
    });
  }

  return File;

})();

exports.JSFile = JSFile = (function() {

  __extends(JSFile, File);

  function JSFile(filepath, filename, name, contents, production) {}

  return JSFile;

})();

exports.CSSFile = CSSFile = (function() {

  __extends(CSSFile, File);

  function CSSFile(filepath, filename, name, contents) {
    CSSFile.__super__.constructor.call(this, filepath, filename, name, contents);
  }

  return CSSFile;

})();
