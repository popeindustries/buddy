var CSSFile, File, JSFile, fs, log, path;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

fs = require('fs');

path = require('path');

log = console.log;

exports.File = File = (function() {

  File.prototype.RE_COFFEE_EXT = /\.coffee$/;

  File.prototype.RE_JS_EXT = /\.js$/;

  File.prototype.RE_STYLUS_EXT = /\.styl$/;

  File.prototype.RE_LESS_EXT = /\.less$/;

  File.prototype.RE_INDENT = /(^\t|^ +)\w/m;

  File.prototype.RE_LINE_BEGIN = /^/gm;

  File.prototype.RE_UPPERCASE = /[A-Z]/;

  File.prototype.base = null;

  function File(filepath, base) {
    this.filepath = filepath;
    this.base = base;
    this.filename = path.basename(this.filepath);
    this.name = this.filename.replace(path.extname(this.filename), '');
    this.contents = null;
    this.contentsModule = null;
  }

  File.prototype.updateContents = function(contents) {
    return this.contents = contents;
  };

  return File;

})();

exports.JSFile = JSFile = (function() {

  __extends(JSFile, File);

  function JSFile(filepath, base, contents) {
    JSFile.__super__.constructor.call(this, filepath, base);
    this.module = this._getModuleName();
    this.updateContents(contents || fs.readFileSync(this.filepath, 'utf8'));
  }

  JSFile.prototype.updateContents = function(contents) {
    var indent;
    this.contents = contents;
    if (this.RE_COFFEE_EXT.test(this.filepath)) {
      indent = contents.match(this.RE_INDENT)[1] || '\t';
      return this.contentsModule = "require.module '" + this.module + "', (module, exports, require) ->\n" + (contents.replace(this.RE_LINE_BEGIN, indent));
    } else {
      return this.contentsModule = "`require.module('" + this.module + "', function(module, exports, require) {\n" + contents + "\n});`";
    }
  };

  JSFile.prototype._getModuleName = function() {
    var i, letter, letters, module, _len;
    module = path.relative(this.base, this.filepath).replace(path.extname(this.filename), '');
    if (this.RE_UPPERCASE.test(this.name)) {
      letters = this.name.split('');
      for (i = 0, _len = letters.length; i < _len; i++) {
        letter = letters[i];
        if (this.RE_UPPERCASE.test(letter)) {
          letters[i] = (i > 0 ? '_' : '') + letter.toLowerCase();
        }
      }
      module = module.replace(this.name, letters.join().replace(/,/g, ''));
    }
    return module;
  };

  return JSFile;

})();

exports.CSSFile = CSSFile = (function() {

  __extends(CSSFile, File);

  function CSSFile(filepath, base) {
    CSSFile.__super__.constructor.call(this, filepath, base);
    this.updateContents(fs.readFileSync(this.filepath, 'utf8'));
  }

  return CSSFile;

})();
