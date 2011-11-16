var CSSTarget, JSTarget, Target, coffee, fs, growl, log, path, stylus, term, uglify;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

fs = require('fs');

path = require('path');

term = require('./terminal');

coffee = require('coffee-script');

stylus = require('stylus');

uglify = require('uglify-js');

growl = require('growl');

log = console.log;

exports.Target = Target = (function() {

  function Target(input, output, sourceCache) {
    this.input = input;
    this.output = output;
    this.sourceCache = sourceCache;
    this.sources = [];
    this._parseInputs(this.input);
  }

  Target.prototype.run = function(mini, bare) {
    if (this.sources.length) {
      term.out("Building " + (term.colour(path.basename(this.input), term.GREY)) + " to " + (term.colour(path.basename(this.output), term.GREY)), 2);
      return this._build(mini, bare);
    } else {
      return term.out("" + (term.colour('WARN [empty]', term.YELLOW)) + " no sources to build in " + (term.colour(this.input, term.GREY)), 2);
    }
  };

  Target.prototype._parseInputs = function(input) {
    var file, item, _i, _len, _ref, _results;
    if (fs.statSync(input).isFile()) {
      if (file = this.sourceCache.byPath[input]) {
        return this._addInput(file);
      } else {
        return term.out("" + (term.colour('WARN [not found]', term.YELLOW)) + " " + (term.colour(this.input, term.GREY)) + " not found in sources", 2);
      }
    } else {
      _ref = fs.readdirSync(input);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(this._parseInput(item));
      }
      return _results;
    }
  };

  Target.prototype._makeDirectory = function(filepath) {
    var dir;
    dir = path.dirname(filepath);
    if (!path.existsSync(dir)) return fs.mkdirSync(dir, 0777);
  };

  Target.prototype._displayNotification = function(message) {
    var options;
    if (message == null) message = '';
    options = {
      title: 'BUILDER'
    };
    try {
      return growl.notify(message, options);
    } catch (_error) {}
  };

  return Target;

})();

exports.JSTarget = JSTarget = (function() {
  var _minify;

  __extends(JSTarget, Target);

  JSTarget.prototype.BUILT_HEADER = '/*BUILT ';

  JSTarget.prototype.REQUIRE = 'require.js';

  function JSTarget(input, output, sourceCache) {
    JSTarget.__super__.constructor.call(this, input, output, sourceCache);
    this.concatenate = fs.statSync(this.input).isFile();
    if (this.concatenate && !path.extname(this.output).length) {
      this.output = path.join(this.output, path.basename(this.input)).replace(path.extname(this.input), '.js');
    }
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
          term.out("" + (term.colour('ERROR [not found]', term.RED)) + " dependency " + (term.colour(dependency, term.GREY)) + " for " + (term.colour(this.module, term.GREY)) + " not found", 4);
        }
      }
    }
    if (__indexOf.call(this.sources, file) < 0) return this.sources.push(file);
  };

  JSTarget.prototype._build = function(mini, bare) {
    var compiled, contents, file, filepath, _i, _j, _len, _len2, _ref, _ref2, _results;
    if (this.concatenate) {
      contents = [];
      if (!(bare || this.nodejs)) {
        contents.push("`" + (fs.readFileSync(path.join(__dirname, this.REQUIRE), 'utf8')) + "`");
      }
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        contents.push(file.contents);
      }
      compiled = this._compile(contents.join('\n\n'), this.input, true);
      if (!compiled) return null;
      compiled = "" + this.BUILT_HEADER + (new Date().toString()) + "*/\n" + compiled;
      term.out("" + (term.colour('COMPILED', term.GREEN)) + " " + (term.colour(this.input, term.GREY)), 4);
      if (mini) {
        return this._minify(this.output, compiled);
      } else {
        return fs.writeFileSync(this.output, compiled, 'utf8');
      }
    } else {
      _ref2 = this.sources;
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        file = _ref2[_j];
        filepath = path.join(this.output, file.name) + '.js';
        this._makeDirectory(filepath);
        if (file.compile) {
          compiled = this._compile(file.contents, filepath, this.nodejs);
          if (!compiled) return null;
          fs.writeFileSync(filepath, compiled, 'utf8');
          _results.push(term.out("" + (term.colour('COMPILED', term.GREEN)) + " " + (term.colour(filepath, term.GREY)), 4));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  JSTarget.prototype._compile = function(contents, name, bare) {
    var compiled, opts;
    try {
      opts = bare ? {
        bare: true
      } : {};
      compiled = coffee.compile(contents, opts);
      return compiled;
    } catch (error) {
      term.out("" + (term.colour('ERROR [compile]', term.RED)) + " compiling " + (term.colour(name, term.GREY)) + ": " + error, 4);
      this._displayNotification("error compiling " + name + ": " + error);
      return null;
    }
  };

  _minify = function(file, contents) {
    var ast, compressed, jsp, pro;
    term.out("Minifying " + (term.colour(file, term.GREY)), 2);
    jsp = uglify.parser;
    pro = uglify.uglify;
    ast = jsp.parse(contents);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    compressed = pro.gen_code(ast);
    fs.writeFileSync(file, compressed);
    return term.out("" + (term.colour('MINIFIED', term.GREEN)) + " " + (term.colour(file, term.GREY)), 4);
  };

  return JSTarget;

})();

exports.CSSTarget = CSSTarget = (function() {

  __extends(CSSTarget, Target);

  function CSSTarget(input, output, sourceCache) {}

  CSSTarget.prototype._addInput = function(file) {
    if (__indexOf.call(this.sources, file) < 0) return this.sources.push(file);
  };

  CSSTarget.prototype._build = function(mini, bare) {};

  return CSSTarget;

})();
