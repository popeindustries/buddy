'use strict';

const { exec } = require('child_process');
const buddyFactory = require('../lib/buddy');
const cssoPlugin = require('../packages/buddy-plugin-csso');
const expect = require('expect.js');
const fs = require('fs');
const imageminPlugin = require('../packages/buddy-plugin-imagemin');
const lessPlugin = require('../packages/buddy-plugin-less');
const nunjucksPlugin = require('../packages/buddy-plugin-nunjucks');
const path = require('path');
const rimraf = require('rimraf');
const stylusPlugin = require('../packages/buddy-plugin-stylus');
const uglifyPlugin = require('../packages/buddy-plugin-uglify');
let buddy;

describe('Buddy', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy'));
  });
  beforeEach(() => {
    buddy = null;
  });
  afterEach(() => {
    buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });

  describe('factory', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/init'));
    });

    it('should initialize a single build', () => {
      buddy = buddyFactory({
        build: [{
          input: 'build/a.js',
          output: '.'
        }]
      });

      expect(buddy.builds).to.have.length(1);
    });
    it('should initialize a single build with nested child build', () => {
      buddy = buddyFactory({
        build: [{
          input: 'build/a.js',
          output: '.',
          build: [{
            input: 'build/lib',
            output: '.'
          }]
        }]
      });

      expect(buddy.builds).to.have.length(1);
      expect(buddy.builds[0].build).to.have.length(1);
    });
  });

  describe('build()', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
    });

    describe('js', () => {
      it('should build a js file when passed a json config path', (done) => {
        buddy = buddyFactory('buddy-single-file.json');
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("!(function () {\n/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/\n})()");
          done();
        });
      });
      it('should build a js file when passed a js config path', (done) => {
        buddy = buddyFactory('buddy-single-file.js');
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("!(function () {\n/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/\n})()");
          done();
        });
      });
      it('should build a js file when passed a json config object', (done) => {
        buddy = buddyFactory({
          input: 'foo.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("!(function () {\n/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/\n})()");
          done();
        });
      });
      it('should build a js file with 1 dependency', (done) => {
        buddy = buddyFactory({
          input: 'bar.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const contents = fs.readFileSync(filepaths[0], 'utf8');

          expect(contents).to.contain("/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/");
          expect(contents).to.contain("var _barjs_foo = $m['foo.js']");
          done();
        });
      });
      it('should build a js file with circular dependency', (done) => {
        buddy = buddyFactory({
          input: 'a.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const contents = fs.readFileSync(filepaths[0], 'utf8');

          expect(contents).to.contain("!(function () {\n/*++ b.js ++*/\n$m['b.js'] = function () {\n$m['b.js'] = _bjs_b;\n\nvar _bjs_a = $m['a.js'];\n\nfunction _bjs_b() {\n  console.log('b');\n}\n}\n$m['b.js'].__b__=1;\n/*-- b.js --*/\n\n/*++ a.js ++*/\n$m['a.js'] = _ajs_a;\n\nvar _ajs_b = require('b.js');\n\nfunction _ajs_a() {\n  console.log('a');\n}\n/*-- a.js --*/\n})()");
          done();
        });
      });
      it('should build a js file with properly ordered nested dependencies', (done) => {
        buddy = buddyFactory({
          input: 'c.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const contents = fs.readFileSync(filepaths[0], 'utf8');

          expect(contents).to.contain("!(function () {\n/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/\n\n/*++ e.js ++*/\nvar _ejs_foo = $m['foo.js'];\n/*-- e.js --*/\n\n/*++ d.js ++*/\nvar _djs_e = $m['e.js'];\n/*-- d.js --*/\n\n/*++ c.js ++*/\nvar _cjs_foo = $m['foo.js'],\n    _cjs_d = $m['d.js'];\n/*-- c.js --*/\n})()");
          done();
        });
      });
      it('should build a js file with node_modules dependencies', (done) => {
        buddy = buddyFactory({
          input: 'bat.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['bar/bar.js#0.0.0'] = 'bar';");
          expect(content).to.contain("var _foofoojs000_bar = $m['bar/bar.js#0.0.0'];");
          expect(content).to.contain("var _batjs_foo = $m['foo/foo.js#0.0.0'];");
          done();
        });
      });
      it('should build a js file with relative node_modules dependencies', (done) => {
        buddy = buddyFactory({
          input: 'boo.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['bar/dist/commonjs/lib/bar.js#0.0.0'] = 'bar';");
          expect(content).to.contain("var _boojs_bar = $m['bar/dist/commonjs/lib/bar.js#0.0.0']");
          done();
        });
      });
      it('should build a js file with node_modules dependencies with missing "main" reference', (done) => {
        buddy = buddyFactory({
          input: 'zong.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['foo.js/index.js#1.0.0'] = 'foo.js';");
          done();
        });
      });
      it('should build a js file with json dependency', (done) => {
        buddy = buddyFactory({
          input: 'bing.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');
          expect(content).to.contain('var _bingjs_json = {\n  "content": "foo"\n}');
          done();
        });
      });
      it('should build a js file with json node_modules dependency', (done) => {
        buddy = buddyFactory({
          input: 'zing.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _zingjs_boo = $m['boo/index.js#1.0.0'];");
          expect(content).to.contain('var _booindexjs100_json = {\n  "boo": "boo"\n}');
          done();
        });
      });
      it('should build a js file with missing dependency', (done) => {
        buddy = buddyFactory({
          input: 'beep.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _beepjs_what = require('what');");
          done();
        });
      });
      it('should build a js file with disabled dependency', (done) => {
        buddy = buddyFactory({
          input: 'bong.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain('var _bongjs_bat = {};');
          done();
        });
      });
      it('should build a js file with disabled native dependency', (done) => {
        buddy = buddyFactory({
          input: 'native.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain('var _nativejs_http = {};');
          done();
        });
      });
      it('should build a js file with specified source directory', (done) => {
        process.env.BROWSER_PATH = 'js-directory/nested';
        buddy = buddyFactory({
          input: 'js-directory/nested/foo.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['foo.js'] = 'foo';");
          process.env.BROWSER_PATH = '';
          done();
        });
      });
      it.skip('should build a prewrapped js file', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'wrapped.js',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          var content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal("/* generated by Buddy */\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = {env:{}};\nif (self._m_ == null) self._m_ = {};\nif (self.require == null) {\n  self.require = function require (id) {\n    if (_m_[id]) return (_m_[id].boot) ? _m_[id]() : _m_[id];\n\n    if (\'test\' == \'development\') {\n      console.warn(\'module \' + id + \' not found\');\n    }\n  };\n}\n_m_[\'wrapped.js\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  var wrapped = this;\n\n  return module.exports;\n}).call({filename:\'wrapped.js\',exports:{}});");
          done();
        });
      });
      it.skip('should build a browserified js file', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'browserify.js',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          var content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('/* generated by Buddy */\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = {env:{}};\nif (self._m_ == null) self._m_ = {};\nif (self.require == null) {\n  self.require = function require (id) {\n    if (_m_[id]) return (_m_[id].boot) ? _m_[id]() : _m_[id];\n\n    if (\'test\' == \'development\') {\n      console.warn(\'module \' + id + \' not found\');\n    }\n  };\n}\n_m_[\'browserify.js\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.superagent=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module \'"+o+"\'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n  \n  /**\n   * Expose `Emitter`.\n   */\n  \n  module.exports = Emitter;\n  \n  /**\n   * Initialize a new `Emitter`.\n   *\n   * @api public\n   */\n  \n  function Emitter(obj) {\n    if (obj) return mixin(obj);\n  };\n  \n  },{"emitter":1,"reduce":2}]},{},[3])(3)\n  });\n\n  return module.exports;\n}).call({exports:{}});');
          done();
        });
      });
      it('should build a js file with unique hashed name', (done) => {
        buddy = buddyFactory({
          input: 'foo.js',
          output: 'output/foo-%hash%.js'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          expect(path.basename(filepaths[0])).to.eql('foo-2b23c217cf1937e19576e0428db7afff.js');
          done();
        });
      });
      it('should build a minified js file if "compress" is true', (done) => {
        buddy = buddyFactory({
          input: 'bar.js',
          output: 'output'
        }, { compress: true, plugins: [uglifyPlugin] });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('if("undefined"==typeof self)var self=this;if("undefined"==typeof global)var global=self;if("undefined"==typeof process)var process={env:{}};self.$m||(self.$m={}),self.require||(self.require=function(e){if($m[e])return $m[e].__b__&&$m[e](),$m[e]}),!function(){$m["foo.js"]="foo";var e=$m["foo.js"];$m["bar.js"]=e}();');
          done();
        });
      });
      it('should build a non-bootstrapped js file if "bootstrap" is false', (done) => {
        buddy = buddyFactory({
          input: 'foo.js',
          output: 'output',
          bootstrap: false
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['foo.js'] = function () {\n/*++ foo.js ++*/\n$m['foo.js'] = 'foo';\n/*-- foo.js --*/\n}\n$m['foo.js'].__b__=1;");
          done();
        });
      });
      it.skip('should remove dead code when referencing "process.env.RUNTIME" and compressing', (done) => {
        buddy = buddyFactory({
          input: 'zee.js',
          output: 'output'
        }, { compress: true, plugins: [uglifyPlugin] });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');
          console.log(content)
          // expect(content).to.not.contain('_m_["foo.js"]=function');
          // expect(content).to.contain('_m_["boop.js"]=function');
          // expect(content).to.contain('var s=!1;return console.log("is dev: ",s)');
          done();
        });
      });
      it('should expose BUDDY_VERSION to source files', (done) => {
        buddy = buddyFactory({
          input: 'env-1.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.match(/var _env1js_version = '\d\.\d\.\d/);
          done();
        });
      });
      it('should expose BUDDY_X_X to source files', (done) => {
        buddy = buddyFactory({
          input: 'env-2.js',
          output: 'output',
          label: 'env'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _env2js_hash = '696768116e504ebcba3b436af9e645c9';");
          done();
        });
      });
      it('should build a node bundle when "version=node"', (done) => {
        buddy = buddyFactory({
          input: 'node.js',
          output: 'output',
          version: 'node'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _nativejs_http = require('http');");
          expect(content).to.contain("var _nodejs_http = $m['native.js'];");
          expect(content).to.contain('var _nodejs_runtime = process.env.RUNTIME;');
          expect(content).to.contain('module.exports = function () {};');
          done();
        });
      });
    });

    describe('css', () => {
      it('should build a css file', (done) => {
        buddy = buddyFactory({
          input: 'a.css',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n');
          done();
        });
      });
      it('should build a css file with inlined dependencies', (done) => {
        buddy = buddyFactory({
          input: 'b.css',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n\n\ndiv {\n  color: red;\n}');
          done();
        });
      });
      it('should build a stylus file', (done) => {
        buddy = buddyFactory({
          input: 'a.styl',
          output: 'output'
        }, { plugins: [stylusPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('body {\n  color: #fff;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n');
          done();
        });
      });
      it('should build a less file', (done) => {
        buddy = buddyFactory({
          input: 'a.less',
          output: 'output'
        }, { plugins: [lessPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('#header {\n  color: #333333;\n  border-left: 1px;\n  border-right: 2px;\n}\n#footer {\n  color: #114411;\n  border-color: #7d2717;\n}\n');
          done();
        });
      });
      it('should build a minified css file if "compress" is true', (done) => {
        buddy = buddyFactory({
          input: 'a.css',
          output: 'output'
        }, { compress: true, plugins: [cssoPlugin] });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain('body{color:#fff;font-size:12px}body p{font-size:10px}');
          done();
        });
      });
    });

    describe('img', () => {
      it('should copy an image directory', (done) => {
        buddy = buddyFactory({
          input: 'image-directory',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(2);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          done();
        });
      });
      it('should compress and copy an image directory', (done) => {
        buddy = buddyFactory({
          input: 'image-directory',
          output: 'output'
        }, { compress: true, plugins: [imageminPlugin]});
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(2);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          expect(fs.readFileSync(filepaths[0], 'utf8')).to.eql('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25"/></svg>');
          done();
        });
      });
    });

    describe('html', () => {
      it('should build an html file with inline css dependency', (done) => {
        buddy = buddyFactory({
          input: 'a.html',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <style>body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n</style>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build an html file with inline js dependency', (done) => {
        buddy = buddyFactory({
          input: 'b.html',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var f = \'f\';</script>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build an html file with inline js dependency needing env substitution', (done) => {
        buddy = buddyFactory({
          input: 'c.html',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var boop = this\n  , isDev = \'test\' == \'development\';\n\nconsole.log(\'is dev: \', isDev);</script>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build a nunjucks template file with sidecar data file', (done) => {
        buddy = buddyFactory({
          input: 'a.nunjs',
          output: 'output'
        }, { plugins: [nunjucksPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>a</title>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build a nunjucks template file with sidecar data file and includes', (done) => {
        buddy = buddyFactory({
          input: 'b.nunjs',
          output: 'output'
        }, { plugins: [nunjucksPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n<head>\n  <title>b</title>\n  <style>body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n</style>\n</head>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build a nunjucks template file with inline js dependency', (done) => {
        buddy = buddyFactory({
          input: 'c.nunjs',
          output: 'output'
        }, { plugins: [nunjucksPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var f = \'f\';</script>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it('should build a nunjucks template file with inline js dependency needing env substitution', (done) => {
        buddy = buddyFactory({
          input: 'd.nunjs',
          output: 'output'
        }, { plugins: [nunjucksPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var boop = this\n  , isDev = \'test\' == \'development\';\n\nconsole.log(\'is dev: \', isDev);</script>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it.skip('should build an html template file with include and inline css dependency', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'bing.nunjs',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>Title</title>\n  <style>body {\n\tcolor: white;\n\tfont-size: 12px;\n}\nbody p {\n\tfont-size: 10px;\n}\n</style>\n</head>\n<body>\n\n</body>\n</html>');
          done();
        });
      });
      it.skip('should build an html template file with compressed inline js dependency when "compress" is true', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'boo.nunjs',
                output: 'output'
              }
            ]
          }
        }, { compress: true }, (err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain('<script>var bang=this,boo="bang";</script>');
          done();
        });
      });
      it.skip('should build an html template file with dynamically generated inline svg dependencies', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'bar.nunjs',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain('<svg id="Layer_1" x="0px" y="0px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 100 100">\n<circle cx="50" cy="50" r="25"/>\n</svg>\n  \n\t <svg id="Layer_1" x="0px" y="0px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 100 100">\n<circle cx="25" cy="25" r="25"/>\n</svg>');
          done();
        });
      });
    });

    describe.skip('batch', () => {
      it('should build a directory of 3 js files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/flat',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(3);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const content = fs.readFileSync(filepath, 'utf8');

            expect(content).to.contain('/* generated by Buddy */');
            expect(content).to.contain("_m_['js-directory/flat/");
          });
          done();
        });
      });
      it('should build a directory of 3 unwrapped js files if "modular" is false', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/flat',
                output: 'output',
                modular: false
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(3);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            expect(fs.readFileSync(filepath, 'utf8')).to.not.contain('_m_[');
          });
          done();
        });
      });
      it('should build a directory of unwrapped js files if "modular" is false, including dependencies', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/dependant',
                output: 'output',
                modular: false
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(3);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            expect(fs.readFileSync(filepath, 'utf8')).to.not.contain('_m_[');
            expect(fs.readFileSync(filepath, 'utf8')).to.not.contain('generated by Buddy');
          });
          done();
        });
      });
      it('should build a directory of 3 js files, including nested directories', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/nested',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(3);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const content = fs.readFileSync(filepath, 'utf8');
            const name = path.basename(filepath, '.js');

            expect(content).to.contain("_m_['js-directory/nested");
            if (name == 'index.js') expect(filepath).to.contain('nested/boo/index.js');
          });
          done();
        });
      });
      it('should build a directory of 2 js files, including dependencies in nested directories', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/dependant',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const content = fs.readFileSync(filepath, 'utf8');

            expect(content).to.contain("_m_['js-directory/dependant");
          });
          done();
        });
      });
      it('should build a directory of 2 css files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'css-directory',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
          });
          done();
        });
      });
      it('should build multiple css files with shared dependencies', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: ['one.styl', 'two.styl'],
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content1 = fs.readFileSync(filepaths[0], 'utf8');
          const content2 = fs.readFileSync(filepaths[1], 'utf8');

          expect(content1).to.eql(content2);
          expect(content1).to.contain("colour: '#ffffff';");
          expect(content2).to.contain("colour: '#ffffff';");
          done();
        });
      });
      it('should build a directory with mixed content, including dependencies', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'mixed-directory',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const ext = path.extname(filepath);
            const content = fs.readFileSync(filepath, 'utf8');

            if (ext == '.js') {
              expect(content).to.contain("_m_['mixed-directory/bar.js']=");
              expect(content).to.contain("_m_['mixed-directory/foo.js']=");
            } else {
              expect(content).to.contain('body {');
              expect(content).to.contain('h1 {');
            }
          });
          done();
        });
      });
      it('should build a globbed collection of js files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'js-directory/flat/{foo,bar}.js',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const content = fs.readFileSync(filepath, 'utf8');

            expect(content).to.contain("_m_['js-directory/flat/");
          });
          done();
        });
      });
      it('should build a globbed collection of mixed files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'mixed-directory/foo.{js,styl}',
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const ext = path.extname(filepath);
            const content = fs.readFileSync(filepath, 'utf8');

            if (ext == '.js') {
              expect(content).to.contain("_m_['mixed-directory/bar.js']=");
              expect(content).to.contain("_m_['mixed-directory/foo.js']=");
            } else {
              expect(content).to.contain('body {');
              expect(content).to.contain('h1 {');
            }
          });
          done();
        });
      });
      it('should build an array of js files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: ['js-directory/flat/foo.js', 'js-directory/nested/bar.js'],
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            expect(fs.readFileSync(filepath, 'utf8')).to.contain("_m_['js-directory/");
          });
          done();
        });
      });
      it('should build an array of mixed files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: ['mixed-directory/foo.js', 'mixed-directory/foo.styl'],
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const ext = path.extname(filepath);
            const content = fs.readFileSync(filepath, 'utf8');

            if (ext == '.js') {
              expect(content).to.contain("_m_['mixed-directory/bar.js']=");
              expect(content).to.contain("_m_['mixed-directory/foo.js']=");
            } else {
              expect(content).to.contain('body {');
              expect(content).to.contain('h1 {');
            }
          });
          done();
        });
      });
      it('should correctly reset files after batch build', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'foo.js',
                output: 'output',
                modular: false
              },
              {
                input: ['foo.js', 'bar.js'],
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const name = path.basename(filepath, '.js');
            const content = fs.readFileSync(filepath, 'utf8');

            if (name == 'foo') {
              expect(content).to.equal('var foo = this;');
            } else {
              expect(content).to.contain("_m_['foo.js']=(function(module,exports){");
            }
          });
          done();
        });
      });
      it('should correctly include shared dependency between files', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: ['bar.js', 'e.js'],
                output: 'output'
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const content = fs.readFileSync(filepath, 'utf8');

            expect(content).to.contain("_m_['foo.js']=(function(module,exports){");
          });
          done();
        });
      });
      it('should correctly ignore references to nested build inputs', (done) => {
        buddy.build({
          build: {
            build: [
              {
                input: 'c.js',
                output: 'output',
                build: [
                  {
                    input: 'd.js',
                    output: 'output'
                  }
                ]
              }
            ]
          }
        }, null, (err, filepaths) => {
          expect(filepaths).to.have.length(2);
          filepaths.forEach((filepath) => {
            expect(fs.existsSync(filepath)).to.be(true);
            const name = path.basename(filepath, '.js');
            const content = fs.readFileSync(filepath, 'utf8');

            if (name == 'c') {
              expect(content).to.contain("foo = _m_['foo.js']");
              expect(content).to.contain("d = require('d.js')");
            } else if (name == 'd') {
              expect(content).to.contain("e = _m_['e.js']");
              expect(content).to.contain("foo = require('foo.js')");
            }
          });
          done();
        });
      });
    });
  });

  describe.skip('script', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/script'));
    });

    it('should run a script after successful build', (done) => {
      buddy.build({
        build: {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            }
          ]
        },
        script: 'node mod.js output/foo.js'
      }, { script: true }, (err, filepaths) => {
        setTimeout(() => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.eql('oops!');
          done();
        }, 1000);
      });
    });
  });

  describe.skip('grep', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/grep'));
    });

    it('should only build matching build', (done) => {
      buddy.build({
        build: {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        }
      }, { grep: '*.js' }, (err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        expect(filepaths[0]).to.eql(path.resolve('output/foo.js'));
        done();
      });
    });
    it('should only build matching build when globbing input', (done) => {
      buddy.build({
        build: {
          build: [
            {
              input: '*.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        }
      }, { grep: 'foo.*' }, (err, filepaths) => {
        expect(filepaths).to.have.length(2);
        expect(filepaths[0]).to.match(/foo\./);
        expect(filepaths[1]).to.match(/foo\./);
        done();
      });
    });
    it('should only build matching build when using "--invert" option', (done) => {
      buddy.build({
        build: {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        }
      }, { grep: '*.js', invert: true }, (err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        expect(filepaths[0]).to.eql(path.resolve('output/foo.css'));
        done();
      });
    });
  });

  describe.skip('watch', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/watch'));
    });

    it('should build watch build', (done) => {
      buddy.build({
        build: {
          build: [
            {
              input: ['foo.js', 'bar.js']
            }
          ]
        }
      }, { watch: true }, (err, filepaths) => {
        expect(filepaths).to.have.length(0);
        done();
      });
    });

    if (process.platform != 'win32') {
      it('should rebuild a watched file on change', (done) => {
        const child = exec('NODE_ENV=dev && ../../../../bin/buddy watch buddy-watch-file.js', {}, (err, stdout, stderr) => {
          console.log(arguments);
          done(err);
        });
        const foo = fs.readFileSync(path.resolve('foo.js'), 'utf8');

        setTimeout(() => {
          fs.writeFileSync(path.resolve('foo.js'), 'var foo = "foo";', 'utf8');
          setTimeout(() => {
            const content = fs.readFileSync(path.resolve('output/foo.js'), 'utf8');

            expect(content).to.contain("_m_[\'foo.js\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  var foo = \"foo\";");
            fs.writeFileSync(path.resolve('foo.js'), foo);
            child.kill();
            done();
          }, 100);
        }, 4000);
      });
    }
  });
});