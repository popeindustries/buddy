var Builder, CONFIG, coffee, file, fs, growl, log, path, stylus, target, term, uglify, _;

fs = require('fs');

path = require('path');

coffee = require('coffee-script');

stylus = require('stylus');

uglify = require('uglify-js');

_ = require('underscore');

growl = require('growl');

log = console.log;

target = require('./target');

file = require('./file');

term = require('./terminal');

CONFIG = 'build.json';

module.exports = Builder = (function() {

  Builder.prototype.JS = 'js';

  Builder.prototype.CSS = 'css';

  Builder.prototype.RE_JS_SRC_EXT = /\.coffee|\.js$/;

  Builder.prototype.RE_CSS_SRC_EXT = /\.styl|\.less$/;

  Builder.prototype.RE_IGNORE_FILE = /^[_|\.]|[-|\.]min\./;

  Builder.prototype.RE_BUILT_HEADER = /^\/\*BUILT/g;

  function Builder() {
    this.config = null;
    this.base = null;
    this.jsSources = {
      locations: [],
      byPath: {},
      count: 0
    };
    this.cssSources = {
      locations: [],
      byPath: {},
      count: 0
    };
    this.jsTargets = [];
    this.cssTargets = [];
  }

  Builder.prototype.compile = function(configpath) {
    return this._initialize(configpath);
  };

  Builder.prototype.watch = function(configpath) {
    return this._initialize(configpath);
  };

  Builder.prototype.deploy = function(configpath) {
    return this._initialize(configpath);
  };

  Builder.prototype._initialize = function(configpath) {
    var item, source, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    if (!this.initialized) {
      if (this._loadConfig(configpath)) {
        if (this._validBuildType(this.JS)) {
          _ref = this.config.js.sources;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            source = _ref[_i];
            this._parseSourceFolder(path.resolve(this.base, source), null, this.jsSources);
          }
          _ref2 = config.js.targets;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            item = _ref2[_j];
            if (target = this._targetFactory(target["in"], target.out, this.JS)) {
              this.jsTargets.push(target);
            }
          }
        }
        if (this._validBuildType(this.CSS)) {
          _ref3 = this.config.css.sources;
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            source = _ref3[_k];
            this._parseSourceFolder(path.resolve(this.base, source), null, this.cssSources);
          }
        }
      }
    }
    return this.initialized = true;
  };

  Builder.prototype._loadConfig = function(configpath) {
    var dir, exists;
    if (configpath) {
      configpath = path.resolve(configpath);
      if (exists = path.existsSync(configpath)) {
        if (fs.statSync(configpath).isDirectory()) {
          configpath = path.join(configpath, CONFIG);
          exists = path.existsSync(configpath);
        }
      }
      if (!exists) {
        term.out("" + (term.colour('ERROR [file not found]', term.RED)) + " " + (term.colour(path.basename(configpath), term.GREY)) + " not found in " + (term.colour(path.dirname(configpath), term.GREY)), 2);
        return false;
      }
    } else {
      while (true) {
        dir = dir != null ? path.resolve(dir, '../') : process.cwd();
        configpath = path.join(dir, CONFIG);
        if (path.existsSync(configpath)) break;
        if (dir === '/') {
          term.out("" + (term.colour('ERROR [file not found]', term.RED)) + " " + (term.colour(CONFIG, term.GREY)) + " not found on this path", 2);
          return false;
        }
      }
    }
    term.out("Loading config file " + (term.colour(configpath, term.GREY)), 2);
    try {
      this.config = JSON.parse(fs.readFileSync(configpath, 'utf8'));
    } catch (e) {
      term.out("" + (term.colour('ERROR [JSON]', term.RED)) + " error parsing " + (term.colour(configpath, term.GREY)), 2);
      return false;
    }
    this.base = path.dirname(configpath);
    return true;
  };

  Builder.prototype._validBuildType = function(type) {
    return this.config[type] && this.config[type].sources && this.config[type].sources.length && this.config[type].targets && this.config[type].targets.length;
  };

  Builder.prototype._parseSourceFolder = function(dir, base, cache) {
    var f, item, itempath, _i, _len, _ref, _results;
    if (base === null) {
      base = dir;
      cache.locations.push(dir);
    }
    _ref = fs.readdirSync(dir);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (!item.match(this.RE_IGNORE_FILE)) {
        itempath = path.resolve(dir, item);
        if (fs.statSync(itempath).isDirectory()) {
          this._parseSourceFolder(itempath, base, cache);
        }
        if (f = this._fileFactory(itempath, base)) {
          cache.byPath[f.filepath] = f;
          _results.push(cache.count++);
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Builder.prototype._fileFactory = function(filepath, base) {
    var contents;
    if (filepath.match(this.RE_JS_SRC_EXT)) {
      contents = fs.readFileSync(filepath, 'utf8');
      if (contents.match(this.RE_BUILT_HEADER)) return null;
      return new file.JSFile(filepath, base, contents);
    } else if (filepath.match(this.RE_CSS_SRC_EXT)) {
      return new file.CSSFile(filepath, base);
    } else {
      return null;
    }
  };

  Builder.prototype._targetFactory = function(input, output, type) {
    var inSources, inputpath, location, outputpath, _i, _len, _ref;
    inputpath = path.resolve(this.base, input);
    outputpath = path.resolve(this.base, ouput);
    _ref = this[type + 'Sources'].location;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      location = _ref[_i];
      inSources = path.dirname(inputpath).test(location);
      if (inSources) break;
    }
    if (!inSources) {
      term.out("" + (term.colour('ERROR [not found]', term.RED)) + " " + (term.colour(input, term.GREY)) + " not found in sources", 2);
      return null;
    }
    if (fs.statSync(inputpath).isDirectory() && fs.statSync(outputpath).isFile()) {
      term.out("" + (term.colour('ERROR [invalid]', term.RED)) + " a file (" + (term.colour(output, term.GREY)) + ") is not a valid output target for a directory (" + (term.colour(input, term.GREY)) + ") input target", 2);
      return null;
    }
    return new target[type.toUpperCase() + 'Target'](inputpath, outputpath);
  };

  return Builder;

})();
