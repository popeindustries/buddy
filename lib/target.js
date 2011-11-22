var CSSTarget, JSTarget, Target, coffee, file, fs, growl, less, log, path, stylus, term, uglify;
var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; }, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

  function Target(input, output, sourceCache) {
    this.input = input;
    this.output = output;
    this.sourceCache = sourceCache;
    this.sources = [];
    this.compress = false;
    this.batch = fs.statSync(this.input).isDirectory();
    this._parseInputs(this.input);
    if (!path.extname(this.output).length && fs.statSync(this.input).isFile()) {
      this.output = path.join(this.output, path.basename(this.input)).replace(path.extname(this.input), this.EXTENSION);
    }
  }

  Target.prototype.run = function(compress, clean) {
    this.compress = compress;
    if (this.sources.length) {
      if (clean) {
        this.sources = [];
        this._parseInputs(this.input);
      }
      term.out("building " + (term.colour(path.basename(this.input), term.GREY)) + " to " + (term.colour(path.basename(this.output), term.GREY)), 2);
      return this._build();
    } else {
      return term.out("" + (term.colour('warning', term.YELLOW)) + " no sources to build in " + (term.colour(this.input, term.GREY)), 2);
    }
  };

  Target.prototype._parseInputs = function(input) {
    var f, item, _i, _len, _ref, _results;
    if (fs.statSync(input).isFile()) {
      if (f = this.sourceCache.byPath[input]) return this._addInput(f);
    } else {
      _ref = fs.readdirSync(input);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(this._parseInputs(path.join(input, item)));
      }
      return _results;
    }
  };

  Target.prototype._addInput = function(file) {
    if (__indexOf.call(this.sources, file) < 0) return this.sources.push(file);
  };

  Target.prototype._makeDirectory = function(filepath) {
    var dir;
    dir = path.dirname(filepath);
    if (!path.existsSync(dir)) return fs.mkdirSync(dir, 0777);
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

exports.JSTarget = JSTarget = (function() {

  __extends(JSTarget, Target);

  JSTarget.prototype.BUILT_HEADER = '/*BUILT ';

  JSTarget.prototype.REQUIRE = 'require.js';

  JSTarget.prototype.EXTENSION = '.js';

  function JSTarget(input, output, sourceCache, nodejs) {
    this.nodejs = nodejs != null ? nodejs : false;
    JSTarget.__super__.constructor.call(this, input, output, sourceCache);
  }

  JSTarget.prototype._addInput = function(file) {
    var dep, dependency, _i, _len, _ref;
    if (file.dependencies.length) {
      _ref = file.dependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dependency = _ref[_i];
        if (dep = this.sourceCache.byModule[dependency] || this.sourceCache.byModule["" + dependency + "/index"]) {
          this._addInput(dep);
        } else {
          term.out("" + (term.colour('warning', term.YELLOW)) + " dependency " + (term.colour(dependency, term.GREY)) + " for " + (term.colour(file.module, term.GREY)) + " not found", 4);
        }
      }
    }
    return JSTarget.__super__._addInput.call(this, file);
  };

  JSTarget.prototype._build = function() {
    var content, contents, f, filepath, _i, _j, _len, _len2, _ref, _ref2;
    if (this.batch) {
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        filepath = path.join(this.output, f.name) + this.EXTENSION;
        content = this.nodejs ? f.contents : f.contentsModule;
        if (f.compile) {
          this._compile(content, filepath, false);
        } else {
          this._writeFile(content, filepath, false);
        }
      }
      return true;
    } else {
      contents = [];
      if (!this.nodejs) {
        contents.push("`" + (fs.readFileSync(path.join(__dirname, this.REQUIRE), 'utf8')) + "`");
      }
      _ref2 = this.sources;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        f = _ref2[_j];
        contents.push(f.contentsModule);
      }
      return this._compile(contents.join('\n\n'), this.output, true);
    }
  };

  JSTarget.prototype._compile = function(content, filepath, header) {
    var compiled;
    try {
      compiled = coffee.compile(content, {
        bare: true
      });
      if (compiled) {
        return this._writeFile(compiled, filepath, header);
      } else {
        return null;
      }
    } catch (error) {
      this._notifyError(filepath, error);
      return null;
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

  JSTarget.prototype._addHeader = function(content) {
    return "" + this.BUILT_HEADER + (new Date().toString()) + "*/\n" + content;
  };

  return JSTarget;

})();

exports.CSSTarget = CSSTarget = (function() {

  __extends(CSSTarget, Target);

  CSSTarget.prototype.EXTENSION = '.css';

  function CSSTarget(input, output, sourceCache) {
    CSSTarget.__super__.constructor.call(this, input, output, sourceCache);
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
    var parser, stylc;
    var _this = this;
    if (file.CSSFile.prototype.RE_STYLUS_EXT.test(extension)) {
      stylc = stylus(content).set('paths', this.sourceCache.locations.concat());
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
        paths: this.sourceCache.locations.concat()
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

})();
