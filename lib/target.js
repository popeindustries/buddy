var CSSTarget, JSTarget, Target, coffee, file, fs, growl, less, log, path, stylus, term, uglify,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

fs = require('fs');

path = require('path');

term = require('./terminal');

coffee = require('coffee-script');

stylus = require('stylus');

less = require('less');

uglify = require('uglify-js');

growl = require('growl');

file = require('./file');

log = console.log;

exports.Target = Target = (function() {

  Target.prototype.RE_PARTIAL = /^_/;

  function Target(input, output, cache) {
    this.input = input;
    this.output = output;
    this.cache = cache;
    this.sources = [];
    this.compress = false;
    this.batch = fs.statSync(this.input).isDirectory();
    if (!path.extname(this.output).length && fs.statSync(this.input).isFile()) {
      this.output = path.join(this.output, path.basename(this.input)).replace(path.extname(this.input), this.EXTENSION);
    }
    this._parseSources(this.input);
  }

  Target.prototype.run = function(compress, clean) {
    this.compress = compress;
    if (this.sources.length) {
      if (clean) {
        this.sources = [];
        this._parseSources(this.input);
      }
      term.out("building " + (term.colour(path.basename(this.input), term.GREY)) + " to " + (term.colour(path.basename(this.output), term.GREY)), 2);
      return this._build();
    } else {
      return term.out("" + (term.colour('warning', term.YELLOW)) + " no sources to build in " + (term.colour(this.input, term.GREY)), 2);
    }
  };

  Target.prototype.hasSource = function(file) {
    return __indexOf.call(this.sources, file) >= 0;
  };

  Target.prototype._parseSources = function(input) {
    var f, item, _i, _len, _ref, _results;
    if (path.existsSync(input)) {
      if (fs.statSync(input).isFile()) {
        if (f = this.cache.byPath[input]) return this._addSource(f);
      } else {
        _ref = fs.readdirSync(input);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(this._parseSources(path.join(input, item)));
        }
        return _results;
      }
    }
  };

  Target.prototype._addSource = function(file) {
    if (__indexOf.call(this.sources, file) < 0 && !this.RE_PARTIAL.test(file.filename)) {
      return this.sources.push(file);
    }
  };

  Target.prototype._makeDirectory = function(filepath) {
    var dir;
    dir = path.dirname(filepath);
    if (!path.existsSync(dir)) {
      try {
        return fs.statSync(dir).isDirectory();
      } catch (error) {
        if (error.code === 'ENOENT') {
          this._makeDirectory(dir);
          return fs.mkdirSync(dir, 0777);
        }
      }
    }
  };

  Target.prototype._notifyError = function(filepath, error) {
    term.out("" + (term.colour('error', term.RED)) + " building " + (term.colour(path.basename(filepath), term.GREY)) + ": " + error, 4);
    try {
      return growl.notify("error building " + filepath + ": " + error, {
        title: 'BUDDY'
      });
    } catch (_error) {}
  };

  return Target;

})();

exports.JSTarget = JSTarget = (function(_super) {

  __extends(JSTarget, _super);

  JSTarget.prototype.BUILT_HEADER = '/*BUILT ';

  JSTarget.prototype.REQUIRE = 'require.js';

  JSTarget.prototype.EXTENSION = '.js';

  JSTarget.prototype.ERROR_LINE_NUMBER = 4;

  JSTarget.prototype.RE_COMPILE_ERROR_LINE = /line\s(\d+)/gi;

  function JSTarget(input, output, cache, nodejs, parentTarget) {
    this.nodejs = nodejs != null ? nodejs : false;
    this.parentTarget = parentTarget != null ? parentTarget : null;
    JSTarget.__super__.constructor.call(this, input, output, cache);
    if (this.nodejs) this.batch = true;
  }

  JSTarget.prototype._addSource = function(file) {
    var dep, dependency, _i, _len, _ref, _ref2;
    if ((_ref = this.parentTarget) != null ? _ref.hasSource(file) : void 0) return;
    if (file.dependencies.length) {
      _ref2 = file.dependencies;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        dependency = _ref2[_i];
        if (dep = this.cache.byModule[dependency] || this.cache.byModule["" + dependency + "/index"]) {
          this._addSource(dep);
        } else {
          term.out("" + (term.colour('warning', term.YELLOW)) + " dependency " + (term.colour(dependency, term.GREY)) + " for " + (term.colour(file.module, term.GREY)) + " not found", 4);
        }
      }
    }
    if (file.filepath === this.input && !this.batch) file.main = true;
    return JSTarget.__super__._addSource.call(this, file);
  };

  JSTarget.prototype._build = function() {
    var content, contents, f, filepath, _i, _j, _len, _len2, _ref, _ref2;
    if (this.batch) {
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        filepath = path.extname(this.output).length ? this.output : path.join(this.output, f.name) + this.EXTENSION;
        content = f.compile ? this._compile(f.contents, filepath) : f.contents;
        if (content != null) {
          if (!this.nodejs) content = f.wrap(content, true, false);
          this._writeFile(content, filepath, false);
        }
      }
      return true;
    } else {
      contents = [];
      _ref2 = this.sources;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        f = _ref2[_j];
        contents.push(f.wrap((f.compile ? this._compile(f.contents, f.filepath) : f.contents), true, false));
      }
      content = contents.join('\n\n');
      if (content != null) {
        if (!(this.nodejs || this.parentTarget)) {
          content = "" + (fs.readFileSync(path.join(__dirname, this.REQUIRE), 'utf8')) + "\n\n" + content;
        }
        this._writeFile(this._wrap(content), this.output, true);
        return true;
      } else {
        return null;
      }
    }
  };

  JSTarget.prototype._compile = function(content, filepath) {
    try {
      return coffee.compile(content, {
        bare: true
      });
    } catch (error) {
      this._notifyError(error, content, filepath);
      return null;
    }
  };

  JSTarget.prototype._notifyError = function(error, content, filepath) {
    var high, l, line, lineNo, lines, low, match, _i, _len, _ref, _results;
    JSTarget.__super__._notifyError.call(this, filepath, error);
    if (match = this.RE_COMPILE_ERROR_LINE.exec(error)) {
      lineNo = +match[1] - 1;
      lines = content.split('\n');
      low = Math.max(lineNo - this.ERROR_LINE_NUMBER, 0);
      high = Math.min(lineNo + this.ERROR_LINE_NUMBER, lines.length - 1);
      l = low;
      _ref = lines.slice(low, high + 1 || 9e9);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (l++ === lineNo) {
          _results.push(term.out("" + (term.colour('> ' + l + ' ' + line, term.RED)), 4));
        } else {
          _results.push(term.out("" + (term.colour(l + ' ' + line, term.GREY)), 5));
        }
      }
      return _results;
    }
  };

  JSTarget.prototype._writeFile = function(content, filepath, header) {
    this._makeDirectory(filepath);
    term.out("" + (term.colour('built', term.GREEN)) + " " + (term.colour(path.basename(filepath), term.GREY)), 4);
    if (this.compress) {
      this._compress(filepath, content, header);
    } else {
      if (header) content = this._addHeader(content);
      fs.writeFileSync(filepath, content, 'utf8');
    }
    return true;
  };

  JSTarget.prototype._compress = function(filepath, contents, header) {
    var ast, compressed, jsp, pro;
    jsp = uglify.parser;
    pro = uglify.uglify;
    ast = jsp.parse(contents);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    compressed = pro.gen_code(ast);
    if (header) compressed = this._addHeader(compressed);
    fs.writeFileSync(filepath, compressed);
    return term.out("" + (term.colour('compressed', term.GREEN)) + " " + (term.colour(path.basename(filepath), term.GREY)), 4);
  };

  JSTarget.prototype._wrap = function(contents) {
    return "(function () {\n" + (contents.replace(file.JSFile.prototype.RE_LINE_BEGIN, '  ')) + "\n}).call(this);";
  };

  JSTarget.prototype._clean = function(contents) {
    return contents;
  };

  JSTarget.prototype._addHeader = function(content) {
    return "" + this.BUILT_HEADER + (new Date().toString()) + "*/\n" + content;
  };

  return JSTarget;

})(Target);

exports.CSSTarget = CSSTarget = (function(_super) {

  __extends(CSSTarget, _super);

  CSSTarget.prototype.EXTENSION = '.css';

  function CSSTarget(input, output, cache) {
    CSSTarget.__super__.constructor.call(this, input, output, cache);
  }

  CSSTarget.prototype._build = function() {
    var f, filepath, _i, _len, _ref;
    if (this.batch) {
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        filepath = path.join(this.output, f.name) + this.EXTENSION;
        if (f.compile) {
          this._compile(f.contents, filepath, path.extname(f.filepath));
        } else {
          this._writeFile(f.contents, filepath);
        }
      }
      return true;
    } else {
      f = this.sources[0];
      return this._compile(f.contents, this.output, path.extname(f.filepath));
    }
  };

  CSSTarget.prototype._compile = function(content, filepath, extension) {
    var parser, stylc,
      _this = this;
    if (file.CSSFile.prototype.RE_STYLUS_EXT.test(extension)) {
      stylc = stylus(content).set('paths', this.cache.locations.concat());
      if (this.compress) stylc.set('compress', true);
      return stylc.render(function(error, css) {
        if (error) {
          _this._notifyError(filepath, error);
          return null;
        } else {
          return _this._writeFile(css, filepath);
        }
      });
    } else if (file.CSSFile.prototype.RE_LESS_EXT.test(extension)) {
      parser = new less.Parser({
        paths: this.cache.locations.concat()
      });
      return parser.parse(content, function(error, tree) {
        if (error) {
          _this._notifyError(filepath, error);
          return null;
        } else {
          return _this._writeFile(tree.toCSS({
            compress: _this.compress
          }), filepath);
        }
      });
    }
  };

  CSSTarget.prototype._writeFile = function(content, filepath) {
    this._makeDirectory(filepath);
    term.out("" + (term.colour('built', term.GREEN)) + " " + (term.colour(path.basename(filepath), term.GREY)), 4);
    fs.writeFileSync(filepath, content, 'utf8');
    return true;
  };

  return CSSTarget;

})(Target);
