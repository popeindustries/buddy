'use strict';

const { exec } = require('child_process');
const buddyFactory = require('../lib/buddy');
const coffeescriptPlugin = require('../packages/buddy-plugin-coffeescript');
const cssoPlugin = require('../packages/buddy-plugin-csso');
const dependencyResolverConfig = require('../lib/dependency-resolver/config');
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

          expect(content).to.contain("!(function () {\n/*== foo.js ==*/\n$m[\'foo.js\'] = { exports: {} };\n$m[\'foo.js\'].exports = \'foo\';\n/*≠≠ foo.js ≠≠*/\n})()");
          done();
        });
      });
      it('should build a js file when passed a js config path', (done) => {
        buddy = buddyFactory('buddy-single-file.js');
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("!(function () {\n/*== foo.js ==*/\n$m[\'foo.js\'] = { exports: {} };\n$m[\'foo.js\'].exports = \'foo\';\n/*≠≠ foo.js ≠≠*/\n})()");
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
          expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("!(function () {\n/*== foo.js ==*/\n$m[\'foo.js\'] = { exports: {} };\n$m[\'foo.js\'].exports = \'foo\';\n/*≠≠ foo.js ≠≠*/\n})()");
          done();
        });
      });
      it('should build a coffeescript file', (done) => {
        buddy = buddyFactory({
          input: 'a.coffee',
          output: 'output'
        }, { plugins: [coffeescriptPlugin] });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('/** BUDDY BUILT **/\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = { env: {} };\nvar $m = self.$m = self.$m || {};\nvar require = self.require || function require (id) {\n  if ($m[id]) {\n    if (\'function\' == typeof $m[id]) $m[id]();\n    return $m[id].exports;\n  }\n\n  if (\'test\' == \'development\') {\n    console.warn(\'module \' + id + \' not found\');\n  }\n};\n!(function () {\n/*== a.coffee ==*/\n$m[\'a.coffee\'] = { exports: {} };\nvar _acoffee_foo;\n\n_acoffee_foo = \'foo\';\n/*≠≠ a.coffee ≠≠*/\n})()');
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
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("/*== foo.js ==*/\n$m[\'foo.js\'] = { exports: {} };\n$m[\'foo.js\'].exports = \'foo\';\n/*≠≠ foo.js ≠≠*/");
          expect(content).to.contain("var _barjs_foo = $m[\'foo.js\'].exports;");
          done();
        });
      });
      it('should build a js file with circular dependency', (done) => {
        buddy = buddyFactory({
          input: 'circular.js',
          output: 'output',
          version: 'node'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("/*== b.js ==*/\n$m[\'b.js\'] = function () {\n$m[\'b.js\'] = { exports: {} };\n$m[\'b.js\'].exports = _bjs_b;\n\nvar _bjs_a = $m[\'a.js\'].exports;\n\nfunction _bjs_b() {\n  console.log(\'b\');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n/*== a.js ==*/\n$m[\'a.js\'] = { exports: {} };\n$m[\'a.js\'].exports = _ajs_a;\n\nvar _ajs_b = require(\'b.js\');\n\nfunction _ajs_a() {\n  console.log(\'a\');\n}\n/*≠≠ a.js ≠≠*/\n\n/*== circular.js ==*/\n$m[\'circular.js\'] = { exports: {} };\nvar _circularjs_a = $m[\'a.js\'].exports;\n/*≠≠ circular.js ≠≠*/");
          expect(eval(content)).to.be.ok();
          done();
        });
      });
      it('should build a js file with complex circular dependency', (done) => {
        buddy = buddyFactory({
          input: 'circular-complex.js',
          output: 'output',
          version: 'node'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("/*== k.js ==*/\n$m[\'k.js\'] = function () {\n$m[\'k.js\'] = { exports: {} };\nvar _kjs_i = $m[\'i.js\'].exports;\n};\n/*≠≠ k.js ≠≠*/\n\n/*== j.js ==*/\n$m[\'j.js\'] = function () {\n$m[\'j.js\'] = { exports: {} };\nvar _jjs_k = require(\'k.js\');\n};\n/*≠≠ j.js ≠≠*/\n\n/*== i.js ==*/\n$m[\'i.js\'] = { exports: {} };\nvar _ijs_j = require(\'j.js\');\n/*≠≠ i.js ≠≠*/\n\n/*== circular-complex.js ==*/\n$m[\'circular-complex.js\'] = { exports: {} };\nvar _circularcomplexjs_i = $m[\'i.js\'].exports;\n/*≠≠ circular-complex.js ≠≠*/");
          expect(eval(content)).to.be.ok();
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
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("!(function () {\n/*== foo.js ==*/\n$m['foo.js'] = { exports: {} };\n$m['foo.js'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n\n/*== e.js ==*/\n$m['e.js'] = { exports: {} };\nvar _ejs_foo = $m['foo.js'].exports;\n/*≠≠ e.js ≠≠*/\n\n/*== d.js ==*/\n$m['d.js'] = { exports: {} };\nvar _djs_e = $m['e.js'].exports;\n/*≠≠ d.js ≠≠*/\n\n/*== c.js ==*/\n$m['c.js'] = { exports: {} };\nvar _cjs_foo = $m['foo.js'].exports,\n    _cjs_d = $m['d.js'].exports;\n/*≠≠ c.js ≠≠*/\n})()");
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

          expect(content).to.contain("$m['bar/bar.js#0.0.0'].exports = 'bar';");
          expect(content).to.contain("var _foofoojs000_bar = $m['bar/bar.js#0.0.0'].exports");
          expect(content).to.contain("var _batjs_foo = $m['foo/foo.js#0.0.0'].exports;");
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

          expect(content).to.contain("$m['bar/dist/commonjs/lib/bar.js#0.0.0'].exports = 'bar';");
          expect(content).to.contain("var _boojs_bar = $m['bar/dist/commonjs/lib/bar.js#0.0.0'].exports");
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

          expect(content).to.contain("$m['foo.js/index.js#1.0.0'].exports = 'foo.js';");
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

          expect(content).to.contain("var _zingjs_boo = $m['boo/index.js#1.0.0'].exports;");
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
        dependencyResolverConfig.sources = ['js-directory/nested'];
        buddy = buddyFactory({
          input: 'js-directory/nested/foo.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("$m['foo.js'].exports = 'foo';");
          dependencyResolverConfig.sources = [];
          done();
        });
      });
      it('should build a buddy built js file', (done) => {
        buddy = buddyFactory({
          input: 'h.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('/** BUDDY BUILT **/\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = { env: {} };\nvar $m = self.$m = self.$m || {};\nvar require = self.require || function require (id) {\n  if ($m[id]) {\n    if (\'function\' == typeof $m[id]) $m[id]();\n    return $m[id].exports;\n  }\n\n  if (\'test\' == \'development\') {\n    console.warn(\'module \' + id + \' not found\');\n  }\n};\n!(function () {\n/*== built.js ==*/\n$m[\'built.js\'] = { exports: {} };\n$m[\'built.js\'].exports = \'built\';\n/*≠≠ built.js ≠≠*/\n\n/*== h.js ==*/\n$m[\'h.js\'] = { exports: {} };\nconst _hjs_foo = $m[\'built.js\'].exports;\n\n$m[\'h.js\'].exports = \'h\';\n/*≠≠ h.js ≠≠*/\n})()');
          done();
        });
      });
      it('should build a browserify js file', (done) => {
        buddy = buddyFactory({
          input: 'browserify.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('/** BUDDY BUILT **/\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = { env: {} };\nvar $m = self.$m = self.$m || {};\nvar require = self.require || function require (id) {\n  if ($m[id]) {\n    if (\'function\' == typeof $m[id]) $m[id]();\n    return $m[id].exports;\n  }\n\n  if (\'test\' == \'development\') {\n    console.warn(\'module \' + id + \' not found\');\n  }\n};\n!(function () {\n/*== browserify.js ==*/\n$m[\'browserify.js\'] = { exports: {} };\n(function (f) {\n  if (typeof $m[\'browserify.js\'].exports === "object" && typeof $m[\'browserify.js\'] !== "undefined") {\n    $m[\'browserify.js\'].exports = f();\n  } else if (typeof define === "function" && define.amd) {\n    define([], f);\n  } else {\n    var g;if (typeof window !== "undefined") {\n      g = window;\n    } else if (typeof global !== "undefined") {\n      g = global;\n    } else if (typeof self !== "undefined") {\n      g = self;\n    } else {\n      g = this;\n    }g.test = f();\n  }\n})(function () {\n  var define, module, exports;return function e(t, n, r) {\n    function s(o, u) {\n      if (!n[o]) {\n        if (!t[o]) {\n          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module \'" + o + "\'");throw f.code = "MODULE_NOT_FOUND", f;\n        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {\n          var n = t[o][1][e];return s(n ? n : e);\n        }, l, l.exports, e, t, n, r);\n      }return n[o].exports;\n    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;\n  }({ 1: [function (require, module, exports) {\n      \'use strict\';\n\n      module.exports = \'TEST\';\n    }, {}], 2: [function (require, module, exports) {\n      \'use strict\';\n\n      var dep = require(\'./dep\');\n\n      module.exports = test;\n\n      function test() {\n        console.log(dep);\n      }\n\n      test();\n    }, { "./dep": 1 }] }, {}, [2])(2);\n});\n/*≠≠ browserify.js ≠≠*/\n})()');
          done();
        });
      });
      it('should build a webpack js file', (done) => {
        buddy = buddyFactory({
          input: 'webpack.js',
          output: 'output'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.equal('/** BUDDY BUILT **/\nif (\'undefined\' === typeof self) var self = this;\nif (\'undefined\' === typeof global) var global = self;\nif (\'undefined\' === typeof process) var process = { env: {} };\nvar $m = self.$m = self.$m || {};\nvar require = self.require || function require (id) {\n  if ($m[id]) {\n    if (\'function\' == typeof $m[id]) $m[id]();\n    return $m[id].exports;\n  }\n\n  if (\'test\' == \'development\') {\n    console.warn(\'module \' + id + \' not found\');\n  }\n};\n!(function () {\n/*== webpack.js ==*/\n$m[\'webpack.js\'] = { exports: {} };\n(function webpackUniversalModuleDefinition(root, factory) {\n  if (typeof $m[\'webpack.js\'].exports === \'object\' && typeof $m[\'webpack.js\'] === \'object\') $m[\'webpack.js\'].exports = factory();else if (typeof define === \'function\' && define.amd) define([], factory);else {\n    var a = factory();\n    for (var i in a) (typeof $m[\'webpack.js\'].exports === \'object\' ? $m[\'webpack.js\'].exports : root)[i] = a[i];\n  }\n})(this, function () {\n  return (/******/function (modules) {\n      // webpackBootstrap\n      /******/ // The module cache\n      /******/var installedModules = {};\n\n      /******/ // The require function\n      /******/function __webpack_require__(moduleId) {\n\n        /******/ // Check if module is in cache\n        /******/if (installedModules[moduleId])\n          /******/return installedModules[moduleId].exports;\n\n        /******/ // Create a new module (and put it into the cache)\n        /******/var module = installedModules[moduleId] = {\n          /******/exports: {},\n          /******/id: moduleId,\n          /******/loaded: false\n          /******/ };\n\n        /******/ // Execute the module function\n        /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\n        /******/ // Flag the module as loaded\n        /******/module.loaded = true;\n\n        /******/ // Return the exports of the module\n        /******/return module.exports;\n        /******/\n      }\n\n      /******/ // expose the modules object (__webpack_modules__)\n      /******/__webpack_require__.m = modules;\n\n      /******/ // expose the module cache\n      /******/__webpack_require__.c = installedModules;\n\n      /******/ // __webpack_public_path__\n      /******/__webpack_require__.p = "";\n\n      /******/ // Load entry module and return exports\n      /******/return __webpack_require__(0);\n      /******/\n    }(\n    /************************************************************************/\n    /******/[\n    /* 0 */\n    /***/function (module, exports, __webpack_require__) {\n\n      \'use strict\';\n\n      var dep = __webpack_require__(1);\n\n      module.exports = test;\n\n      function test() {\n        console.log(dep);\n      }\n\n      test();\n\n      /***/\n    },\n    /* 1 */\n    /***/function (module, exports) {\n\n      \'use strict\';\n\n      module.exports = \'TEST\';\n\n      /***/\n    }\n    /******/])\n  );\n});\n;\n/*≠≠ webpack.js ≠≠*/\n})()');
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
          expect(path.basename(filepaths[0])).to.eql('foo-135bf621ba1b26a834430f30a8e83559.js');
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

          expect(content).to.equal('if("undefined"==typeof self)var self=this;if("undefined"==typeof global)var global=self;if("undefined"==typeof process)var process={env:{}};var $m=self.$m=self.$m||{},require=self.require||function(e){if($m[e])return"function"==typeof $m[e]&&$m[e](),$m[e].exports};!function(){$m["foo.js"]={exports:{}},$m["foo.js"].exports="foo",$m["bar.js"]={exports:{}};var e=$m["foo.js"].exports;$m["bar.js"].exports=e}();');
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

          expect(content).to.contain("$m['foo.js'] = function () {\n/*== foo.js ==*/\n$m['foo.js'] = { exports: {} };\n$m['foo.js'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n}");
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
          expect(content).to.contain("var _nodejs_http = $m['native.js'].exports;");
          expect(content).to.contain("var _nodejs_runtime = 'server';");
          expect(content).to.contain('module.exports = function () {};');
          done();
        });
      });
      it('should build a node bundle with disabled dependency when "version=node"', (done) => {
        buddy = buddyFactory({
          input: 'node.js',
          output: 'output',
          version: 'node',
          resolve: {
            'native.js': false
          }
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _nodejs_http = {};");
          expect(content).to.contain("var _nodejs_runtime = 'server';");
          expect(content).to.contain('module.exports = function () {};');
          done();
        });
      });
      it('should build a node bundle with disabled dependency in third-party dependency', (done) => {
        buddy = buddyFactory({
          input: 'zing.js',
          output: 'output',
          version: 'node',
          resolve: {
            'json': false
          }
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _booindexjs100_json = {};");
          expect(content).to.not.contain('"boo": "boo"');
          done();
        });
      });
      it('should build a node bundle with disabled dependency in third-party dependency file', (done) => {
        buddy = buddyFactory({
          input: 'zang.js',
          output: 'output',
          version: 'node',
          resolve: {
            'json': false
          }
        });
        buddy.build((err, filepaths) => {
          expect(filepaths).to.have.length(1);
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.contain("var _booboojs100_json = {};");
          expect(content).to.not.contain('"boo": "boo"');
          done();
        });
      });
      it('should build a complex dependency tree', (done) => {
        buddy = buddyFactory({
          input: 'lodash.js',
          output: 'output',
          version: 'node'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(eval(content)).to.be.ok();
          done();
        });
      });
      it.only('should build a complex dependency tree with circular dependencies', (done) => {
        buddy = buddyFactory({
          input: 'babel.js',
          output: 'x.js',
          version: 'node'
        });
        buddy.build((err, filepaths) => {
          expect(fs.existsSync(filepaths[0])).to.be(true);
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(eval(content)).to.be.ok();
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

  describe('script', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/script'));
    });

    it('should run a script after successful build', (done) => {
      buddy = buddyFactory({
        build: [{
          input: 'foo.js',
          output: 'output'
        }],
        script: 'node mod.js output/foo.js'
      }, { script: true });
      buddy.build((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.be(true);
        setTimeout(() => {
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.eql('oops!');
          done();
        }, 100);
      });
    });
  });

  describe('grep', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/grep'));
    });

    it('should only build matching build', (done) => {
      buddy = buddyFactory({
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
      }, { grep: '*.js' });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        expect(filepaths[0]).to.eql(path.resolve('output/foo.js'));
        done();
      });
    });
    it('should only build matching build when globbing input', (done) => {
      buddy = buddyFactory({
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
      }, { grep: 'foo.*' });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(2);
        expect(filepaths[0]).to.match(/foo\./);
        expect(filepaths[1]).to.match(/foo\./);
        done();
      });
    });
    it('should only build matching build when using "--invert" option', (done) => {
      buddy = buddyFactory({
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
      }, { grep: '*.js', invert: true });
      buddy.build((err, filepaths) => {
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