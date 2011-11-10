var coffee, config, file, fs, growl, initialize, initialized, log, parseSourceContents, path, stylus, target, term, uglify, util, _;

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

config = null;

initialized = false;

exports.compile = function(configPath) {
  return initialize(configPath);
};

exports.watch = function() {};

exports.deploy = function() {};

initialize = function(configPath) {
  var source, _i, _len, _ref, _results;
  if (path.existsSync(configPath)) {
    term.out("Loading config file " + (term.colour(configPath, term.GREY)), 2);
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.js && config.js.sources && config.js.targets) {
      _ref = config.js.sources;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        _results.push(parseSourceContents(source));
      }
      return _results;
    }
  } else {
    return term.out("" + (term.colour('warning', term.RED)) + " missing " + (term.colour(configPath, term.GREY)) + " file.", 2);
  }
};

parseSourceContents = function(dir, base, cache) {
  var contents, filename, filepath, name, _i, _len, _ref, _results;
  if (cache == null) cache = null;
  base || (base = dir.charAt(dir.length - 1) !== '/' ? "" + dir + "/" : dir);
  _ref = fs.readdirSync(dir);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    filename = _ref[_i];
    filepath = path.join(dir, filename);
    name = (filepath.replace(base, '')).replace(path.extname(filename), '');
    if (filename.match(RE_JS_SRC_EXT)) {
      if (name in jsSources.byName) {
        _results.push(cache != null ? cache.push(jsSources.byName[name]) : void 0);
      } else {
        if (!filename.match(RE_IGNORE)) {
          contents = fs.readFileSync(filepath, 'utf8');
        }
        if (!contents.match(RE_BUILT)) {
          if (filename.match(RE_JS_EXT)) contents = "`" + contents + "`";
          file = new JSFile(filepath, filename, name, contents, production);
          jsSources.byPath[filepath] = file;
          jsSources.byName[name] = file;
          if (file.module) jsSources.byModule[file.module] = file;
          _results.push(jsSources.count++);
        } else {
          _results.push(void 0);
        }
      }
    } else if (filename.match(RE_STYLUS_EXT)) {
      if (filepath in cssSources.byPath) {
        _results.push(cache != null ? cache.push(cssSources.byPath[filepath]) : void 0);
      } else {
        if (!filename.match(RE_IGNORE)) {
          contents = fs.readFileSync(filepath, 'utf8');
        }
        file = new CSSFile(filepath, filename, name, contents);
        cssSources.byPath[filepath] = file;
        _results.push(cssSources.count++);
      }
    } else if (fs.statSync(filepath).isDirectory() && !(filename.match(RE_IGNORE))) {
      _results.push(parseSourceContents(filepath, base, cache));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};
