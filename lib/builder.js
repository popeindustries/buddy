var CONFIG, coffee, file, fs, growl, initialized, log, path, stylus, target, term, uglify, util, _;

fs = require('fs');

path = require('path');

util = require('util');

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

initialized = false;

module.exports = {
  RE_JS_SRC_EXT: /\.coffee|\.js$/,
  RE_CSS_SRC_EXT: /\.styl|\.less$/,
  RE_IGNORE_FILE: /^[_|\.]|[-|\.]min\./,
  RE_BUILT_HEADER: /^\/\*BUILT/g,
  config: null,
  base: null,
  jsSources: {
    byPath: {},
    byName: {},
    byModule: {},
    count: 0
  },
  cssSources: {
    byPath: {},
    count: 0
  },
  jsBuilds: null,
  cssBuilds: null,
  compile: function(configPath) {
    return this._initialize(configPath);
  },
  watch: function() {},
  deploy: function() {},
  _initialize: function(configPath) {
    var source, _i, _j, _len, _len2, _ref, _ref2;
    if (!initialized) {
      if (this._loadConfig(configPath)) {
        if (this.config.js && this.config.js.sources && this.config.js.sources.length && this.config.js.targets && this.config.js.targets.length) {
          _ref = this.config.js.sources;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            source = _ref[_i];
            this._parseSourceFolder(path.resolve(this.base, source));
          }
        }
        if (this.config.css && this.config.css.sources && this.config.css.sources.length && this.config.css.targets && this.config.css.targets.length) {
          _ref2 = this.config.css.sources;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            source = _ref2[_j];
            this._parseSourceFolder(path.resolve(this.base, source));
          }
        }
      }
    }
    return initialized = true;
  },
  _loadConfig: function(configPath) {
    var dir;
    if (configPath) {
      configPath = path.resolve(configPath);
      if (!path.existsSync(configPath)) {
        term.out("" + (term.colour('warning', term.RED)) + " " + (term.colour(path.basename(configPath), term.GREY)) + " not found in " + (term.colour(path.dirname(configPath), term.GREY)), 2);
        return false;
      }
    } else {
      while (true) {
        dir = dir != null ? path.resolve(dir, '../') : process.cwd();
        configPath = path.join(dir, CONFIG);
        if (path.existsSync(configPath)) break;
        if (dir === '/') {
          term.out("" + (term.colour('warning', term.RED)) + " " + (term.colour(CONFIG, term.GREY)) + " not found on this path", 2);
          term.out("See " + (term.colour('--help', term.GREY)) + " for more info", 3);
          return false;
        }
      }
    }
    term.out("Loading config file " + (term.colour(configPath, term.GREY)), 2);
    try {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      term.out("" + (term.colour('warning', term.RED)) + " error parsing " + (term.colour(configPath, term.GREY)) + " file", 2);
      return false;
    }
    this.base = path.dirname(configPath);
    return true;
  },
  _parseSourceFolder: function(dir, base) {
    var f, item, itempath, _i, _len, _ref, _results;
    if (base == null) base = dir;
    _ref = fs.readdirSync(dir);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (!item.match(this.RE_IGNORE_FILE)) {
        itempath = path.resolve(dir, item);
        if (fs.statSync(itempath).isDirectory()) {
          this._parseSourceFolder(itempath, base);
        }
        if (f = this._fileFactory(itempath, base)) {
          if (f instanceof file.JSFile) {
            this.jsSources.byPath[f.filepath] = f;
            _results.push(this.jsSources.count++);
          } else {
            this.cssSource.byPath[f.filepath] = f;
            _results.push(this.cssSource.count++);
          }
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  _fileFactory: function(filepath, base) {
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
  }
};
