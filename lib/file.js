var CSSFile, File, JSFile, fs, log, path;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

fs = require('fs');

path = require('path');

log = console.log;

exports.File = File = (function() {

  function File(type, filepath, base) {
    this.type = type;
    this.filepath = filepath;
    this.base = base;
    this.filename = path.basename(this.filepath);
    this.name = path.relative(this.base, this.filepath).replace(path.extname(this.filename), '');
    this.contents = null;
    this.compile = false;
    this.lastChange = null;
  }

  File.prototype.updateContents = function(contents) {
    return this.contents = contents;
  };

  return File;

})();

exports.JSFile = JSFile = (function() {

  __extends(JSFile, File);

  JSFile.prototype.RE_COFFEE_EXT = /\.coffee$/;

  JSFile.prototype.RE_JS_EXT = /\.js$/;

  JSFile.prototype.RE_INDENT_WHITESPACE = /(^\t|^ +)\S/m;

  JSFile.prototype.RE_LINE_BEGIN = /^/gm;

  JSFile.prototype.RE_UPPERCASE = /[A-Z]/;

  JSFile.prototype.RE_REQUIRE = /^(?=.*?require\s*\(?\s*['|"]([^'"]*))(?:(?!#|(?:\/\/)).)*$/gm;

  JSFile.prototype.RE_MODULE = /^(?:require\.)?module\s*\(?\s*['|"].+module, ?exports, ?require\s*\)/gm;

  JSFile.prototype.RE_WIN_SEPARATOR = /\\\\?/g;

  function JSFile(type, filepath, base, contents) {
    JSFile.__super__.constructor.call(this, type, filepath, base);
    this.compile = this.RE_COFFEE_EXT.test(this.filepath);
    this.module = this._getModuleName();
    this.main = false;
    this.updateContents(contents || fs.readFileSync(this.filepath, 'utf8'));
  }

  JSFile.prototype.updateContents = function(contents) {
    this.contents = contents;
    return this.dependencies = this._getModuleDependencies();
  };

  JSFile.prototype.wrap = function(contents, isJS, escape) {
    var indent, _ref;
    if (!this.RE_MODULE.test(contents)) {
      indent = ((_ref = contents.match(this.RE_INDENT_WHITESPACE)) != null ? _ref[1] : void 0) || '\t';
      if (!isJS) {
        contents = "require.module '" + this.module + "', (module, exports, require) ->\n" + (contents.replace(this.RE_LINE_BEGIN, indent)) + "\n\n" + (this.main ? "require('" + this.module + "')" : '');
      } else {
        contents = "" + (escape ? '`' : '') + "require.module('" + this.module + "', function(module, exports, require) {\n" + (contents.replace(this.RE_LINE_BEGIN, indent)) + "\n});\n\n" + (this.main ? "require('" + this.module + "');" : '') + (escape ? '`' : '');
      }
    }
    return contents;
  };

  JSFile.prototype._getModuleName = function() {
    var letters, module;
    var _this = this;
    module = path.relative(this.base, this.filepath).replace(path.extname(this.filename), '');
    if (process.platform === 'win32') {
      module = module.replace(this.RE_WIN_SEPARATOR, '/');
    }
    if (this.RE_UPPERCASE.test(this.name)) {
      letters = Array.prototype.map.call(module, function(l, i, arr) {
        if (_this.RE_UPPERCASE.test(l)) {
          return (i > 0 && arr[i - 1] !== '/' ? '_' : '') + l.toLowerCase();
        } else {
          return l;
        }
      });
      module = letters.join().replace(/,/g, '');
    }
    return module;
  };

  JSFile.prototype._getModuleDependencies = function() {
    var dep, deps, match, part, parts, _i, _len, _ref;
    deps = [];
    while (match = this.RE_REQUIRE.exec(this.contents)) {
      dep = match[1];
      parts = dep.split('/');
      if (dep.charAt(0) === '.') {
        parts = this.module.split('/');
        parts.pop();
        _ref = dep.split('/');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          part = _ref[_i];
          if (part === '..') {
            parts.pop();
          } else if (part !== '.') {
            parts.push(part);
          }
        }
      }
      deps.push(parts.join('/'));
    }
    return deps;
  };

  return JSFile;

})();

exports.CSSFile = CSSFile = (function() {

  __extends(CSSFile, File);

  CSSFile.prototype.RE_STYLUS_EXT = /\.styl$/;

  CSSFile.prototype.RE_LESS_EXT = /\.less$/;

  function CSSFile(type, filepath, base) {
    CSSFile.__super__.constructor.call(this, type, filepath, base);
    this.compile = true;
    this.updateContents(fs.readFileSync(this.filepath, 'utf8'));
  }

  return CSSFile;

})();
