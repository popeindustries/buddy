var CSSFile, File, JSFile, fs, path;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

fs = require('fs');

path = require('path');

exports.File = File = (function() {

  File.prototype.RE_COFFEE_EXT = /\.coffee$/;

  File.prototype.RE_JS_EXT = /\.js$/;

  File.prototype.RE_STYLUS_EXT = /\.styl$/;

  File.prototype.RE_LESS_EXT = /\.less$/;

  function File(filepath, contents) {
    this.filepath = filepath;
    this.filename = path.basename(this.filepath);
    this.name = this.filename.replace(path.extname(this.filename), '');
    this.updateContents(contents || fs.readFileSync(this.filepath, 'utf8'));
  }

  File.prototype.updateContents = function(contents) {
    return this.contents = contents;
  };

  return File;

})();

exports.JSFile = JSFile = (function() {

  __extends(JSFile, File);

  function JSFile(filepath, contents) {
    JSFile.__super__.constructor.call(this, filepath, contents);
  }

  JSFile.prototype.updateContents = function(contents) {
    if (this.filepath.match(this.RE_COFFEE_EXT)) {
      return this.contents = "require.module " + this.module + ", (module, exports, require) ->\n	" + (contents.replace('\n', '\n\t'));
    } else {
      return this.contents = "`require.module(" + this.module + ", function(module, exports, require) {\n" + (contents.replace('\n', '\n\t')) + "\n});`";
    }
  };

  return JSFile;

})();

exports.CSSFile = CSSFile = (function() {

  __extends(CSSFile, File);

  function CSSFile(filepath, contents) {
    CSSFile.__super__.constructor.call(this, filepath, contents);
  }

  return CSSFile;

})();
