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
  compile: function(configuration) {
    return this._initialize(configuration);
  },
  watch: function() {},
  deploy: function() {},
  _loadConfig: function() {
    var configPath, dir;
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
    term.out("Loading config file " + (term.colour(configPath, term.GREY)), 2);
    try {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      term.out("" + (term.colour('warning', term.RED)) + " error parsing " + (term.colour(configPath, term.GREY)) + " file", 2);
      return false;
    }
    this.base = dir;
    initialized = true;
    return initialized;
  },
  _initializeJSBuilds: function() {
    var source, _i, _len, _ref, _results;
    if (this.config.js && this.config.js.sources && this.config.js.sources.length && this.config.js.targets && this.config.js.targets.length) {
      _ref = this.config.js.sources;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        _results.push(this._parseSourceContents(path.resolve(this.base, source)));
      }
      return _results;
    }
  },
  _parseSourceContents: function(dir) {
    var filename, filepath, name, _i, _len, _ref, _results;
    log(dir);
    _ref = fs.readdirSync(dir);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      filename = _ref[_i];
      filepath = path.resolve(dir, filename);
      name = filename.replace(path.extname(filename), '');
      _results.push(log(name, filename, filepath));
    }
    return _results;
  }
};
