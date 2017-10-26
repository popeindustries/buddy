const { expect } = require('chai');
const buddyFactory = require('../../lib/buddy');
const dependencyResolverConfig = require('../../lib/resolver/config');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
let buddy;

describe('JS', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });
  after(() => {
    ['yarn.lock', 'node_modules', 'package.json'].forEach(p => {
      if (fs.existsSync(path.resolve(p))) rimraf.sync(path.resolve(p));
    });
  });

  it('should build a js file when passed a json config path', done => {
    buddy = buddyFactory('buddy-single-file.json');
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a js file when passed a js config path', done => {
    buddy = buddyFactory('buddy-single-file.js');
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain(
        "(function () {\n/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a js file when passed a json config object', done => {
    buddy = buddyFactory({
      input: 'foo.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a js file with 1 dependency and source map', done => {
    buddy = buddyFactory(
      {
        input: 'bar.js',
        output: 'output'
      },
      { maps: true }
    );
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');
      const map = JSON.parse(fs.readFileSync(`${filepaths[0]}.map`, 'utf8'));

      expect(content).to.contain(
        "/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/"
      );
      expect(content).to.contain("var bar__foo = $m['foo'].exports;");
      expect(content).to.contain('//# sourceMappingURL=bar.js.map');
      expect(map).to.have.property('mappings', ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAAA;;;;;;ACAA;;AAEA');
      done();
    });
  });
  it('should build a js file with 1 dependency and source map hosted at "sourceroot"', done => {
    buddy = buddyFactory(
      {
        build: [
          {
            input: 'bar.js',
            output: 'output'
          }
        ],
        server: {
          sourceroot: 'http://www.bar.com'
        }
      },
      { maps: true }
    );
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');
      const map = JSON.parse(fs.readFileSync(`${filepaths[0]}.map`, 'utf8'));

      expect(content).to.contain(
        "/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/"
      );
      expect(content).to.contain("var bar__foo = $m['foo'].exports;");
      expect(content).to.contain('//# sourceMappingURL=http://www.bar.com/bar.js.map');
      expect(map).to.have.property('mappings', ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAAA;;;;;;ACAA;;AAEA');
      done();
    });
  });
  it('should build a js file with es6 import', done => {
    buddy = buddyFactory({
      input: 'es6.js',
      output: 'output',
      options: {
        babel: {
          plugins: [['babel-plugin-transform-es2015-modules-commonjs', { loose: true, strictMode: false }]]
        }
      }
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "$m['es6'] = { exports: {} };\n$m['es6'].exports.__esModule = true;\n\n$m['es6'].exports.default = function () {\n  console.log(es6__foo);\n  console.log(es6___bar2.default);\n  console.log(es6__fModule.default, es6__fModule.bat);\n};\n\nvar es6___foo = $m['foo'].exports;\n\nvar es6__foo = babelHelpers.interopRequireWildcard(es6___foo);\n\nvar es6___bar = $m['bar'].exports;\n\nvar es6___bar2 = babelHelpers.interopRequireDefault(es6___bar);\n\nvar es6___f = $m['f'].exports;\n\nvar es6__fModule = babelHelpers.interopRequireWildcard(es6___f);"
      );
      done();
    });
  });
  it('should build a js file with circular dependency', done => {
    buddy = buddyFactory({
      input: 'circular.js',
      output: 'output',
      version: 'node'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "/*== b.js ==*/\n$m['b'] = function () {\n$m['b'] = { exports: {} };\n$m['b'].exports = b__b;\n\nvar b__a = require('a');\n\nfunction b__b() {\n  console.log('b');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n\n/*== a.js ==*/\n$m['a'] = function () {\n$m['a'] = { exports: {} };\n$m['a'].exports = a__a;\n\nvar a__b = require('b');\n\nfunction a__a() {\n  console.log('a');\n}\n};\n/*≠≠ a.js ≠≠*/\n\n\n/*== circular.js ==*/\n$m['circular'] = { exports: {} };\nvar circular__a = require('a');\n/*≠≠ circular.js ≠≠*/"
      );
      expect(eval(content)).to.be.ok();
      done();
    });
  });
  it('should build a js file with complex circular dependency', done => {
    buddy = buddyFactory({
      input: 'circular-complex.js',
      output: 'output',
      version: 'node'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "/*== k.js ==*/\n$m['k'] = function () {\n$m['k'] = { exports: {} };\nvar k__i = require('i');\n};\n/*≠≠ k.js ≠≠*/\n\n\n/*== j.js ==*/\n$m['j'] = function () {\n$m['j'] = { exports: {} };\nvar j__k = require('k');\n};\n/*≠≠ j.js ≠≠*/\n\n\n/*== i.js ==*/\n$m['i'] = function () {\n$m['i'] = { exports: {} };\nvar i__j = require('j');\n};\n/*≠≠ i.js ≠≠*/\n\n\n/*== circular-complex.js ==*/\n$m['circular-complex'] = { exports: {} };\nvar circularcomplex__i = require('i');\n/*≠≠ circular-complex.js ≠≠*/"
      );
      expect(eval(content)).to.be.ok();
      done();
    });
  });
  it('should build a js file with properly ordered nested dependencies', done => {
    buddy = buddyFactory({
      input: 'd.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n\n\n/*== e.js ==*/\n$m['e'] = { exports: {} };\nvar e__foo = $m['foo'].exports;\n/*≠≠ e.js ≠≠*/\n\n\n/*== d.js ==*/\n$m['d'] = { exports: {} };\nvar d__e = $m['e'].exports;\n/*≠≠ d.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a js file with json dependency', done => {
    buddy = buddyFactory({
      input: 'bing.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('var bing__json = {  "content": "foo"}');
      done();
    });
  });
  it('should build a js file with json dependency when bundle=false', done => {
    buddy = buddyFactory({
      input: 'bing.js',
      output: 'output',
      bundle: false
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('var json = {  "content": "foo"}');
      done();
    });
  });
  it('should build a js file with missing dependency', done => {
    buddy = buddyFactory({
      input: 'beep.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain("var beep__what = require('what');");
      done();
    });
  });
  it('should build a js file with disabled native dependency', done => {
    buddy = buddyFactory({
      input: 'native.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('var native__http = {};');
      done();
    });
  });
  it('should build a js file with specified source directory', done => {
    dependencyResolverConfig.sources = [path.resolve('js-directory/nested')];
    buddy = buddyFactory({
      input: 'js-directory/nested/foo.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain("$m['foo'].exports = 'foo';");
      dependencyResolverConfig.sources = [];
      done();
    });
  });
  it('should build a buddy built js file', done => {
    buddy = buddyFactory({
      input: 'h.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n(function () {\n/*== b.js ==*/\n$m['b'] = function () {\n$m['b'] = { exports: {} };\n$m['b'].exports = b__b;\n\nvar b__a = require('a');\n\nfunction b__b() {\n  console.log('b');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n\n/*== a.js ==*/\n$m['a'] = function () {\n$m['a'] = { exports: {} };\n$m['a'].exports = a__a;\n\nvar a__b = require('b');\n\nfunction a__a() {\n  console.log('a');\n}\n};\n/*≠≠ a.js ≠≠*/\n\n\n/*== circular.js ==*/\n$m['built'] = $m['circular'] = { exports: {} };\nvar circular__a = require('a');\n/*≠≠ circular.js ≠≠*/\n})()\n\n\n/*== h.js ==*/\n$m['h'] = { exports: {} };\nconst h__foo = $m['built'].exports;\n\n$m['h'].exports = 'h';\n/*≠≠ h.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a browserify js file', done => {
    buddy = buddyFactory({
      input: 'browserify.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        '(function () {\n/*== browserify.js ==*/\n$m[\'browserify\'] = { exports: {} };\n(function(f){if(typeof $m[\'browserify\'].exports==="object"&&typeof $m[\'browserify\']!=="undefined"){$m[\'browserify\'].exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.test = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module \'"+o+"\'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\nmodule.exports = \'TEST\';\n},{}],2:[function(require,module,exports){\n\nvar dep = require(\'./dep\');\n\nmodule.exports = test;\n\nfunction test () {\n  console.log(dep);\n}\n\ntest();\n},{"./dep":1}]},{},[2])(2)\n});\n/*≠≠ browserify.js ≠≠*/\n})()'
      );
      done();
    });
  });
  it('should build a webpack js file', done => {
    buddy = buddyFactory({
      input: 'webpack.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n/*== webpack.js ==*/\n$m['webpack'] = { exports: {} };\n(function webpackUniversalModuleDefinition(root, factory) {\n  if(typeof $m['webpack'].exports === 'object' && typeof $m['webpack'] === 'object')\n    $m['webpack'].exports = factory();\n  else if(typeof define === 'function' && define.amd)\n    define([], factory);\n  else {\n    var a = factory();\n    for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];\n  }\n})(this, function() {\nreturn /******/ (function(modules) { // webpackBootstrap\n/******/  // The module cache\n/******/  var installedModules = {};\n\n/******/  // The require function\n/******/  function __webpack_require__(moduleId) {\n\n/******/    // Check if module is in cache\n/******/    if(installedModules[moduleId])\n/******/      return installedModules[moduleId].exports;\n\n/******/    // Create a new module (and put it into the cache)\n/******/    var module = installedModules[moduleId] = {\n/******/      exports: {},\n/******/      id: moduleId,\n/******/      loaded: false\n/******/    };\n\n/******/    // Execute the module function\n/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\n/******/    // Flag the module as loaded\n/******/    module.loaded = true;\n\n/******/    // Return the exports of the module\n/******/    return module.exports;\n/******/  }\n\n\n/******/  // expose the modules object (__webpack_modules__)\n/******/  __webpack_require__.m = modules;\n\n/******/  // expose the module cache\n/******/  __webpack_require__.c = installedModules;\n\n/******/  // __webpack_public_path__\n/******/  __webpack_require__.p = \"\";\n\n/******/  // Load entry module and return exports\n/******/  return __webpack_require__(0);\n/******/ })\n/************************************************************************/\n/******/ ([\n/* 0 */\n/***/ function(module, exports, __webpack_require__) {\n\n  \n  var dep = __webpack_require__(1);\n\n  module.exports = test;\n\n  function test () {\n    console.log(dep);\n  }\n\n  test();\n\n/***/ },\n/* 1 */\n/***/ function(module, exports) {\n\n  \n  module.exports = 'TEST';\n\n/***/ }\n/******/ ])\n});\n;\n/*≠≠ webpack.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a closure compiler js file', done => {
    buddy = buddyFactory({
      input: 'closure.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "(function () {\n/*== closure.js ==*/\n$m['closure'] = { exports: {} };\n;(function (root, factory) {\n  if (typeof $m['closure'].exports === \"object\") {\n    $m['closure'].exports = factory.call(root);\n  } else if (typeof define === \"function\" && define.amd) {\n    define([], factory);\n  } else {\n    root.ol = factory();\n  }\n}(window, function () {\nvar OPENLAYERS = {};\nvar p,ca=this;\n}));\n/*≠≠ closure.js ≠≠*/\n})()"
      );
      done();
    });
  });
  it('should build a js file with unique hashed name', done => {
    buddy = buddyFactory({
      input: 'foo.js',
      output: 'output/foo-%hash%.js'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      expect(path.basename(filepaths[0])).to.eql('foo-425bf60bc677deed2b2e5627f7313a58.js');
      done();
    });
  });
  it('should build a minified js file if "compress" is true', done => {
    buddy = buddyFactory(
      {
        input: 'bar.js',
        output: 'output'
      },
      { compress: true, maps: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal(
        '"use strict";if(void 0===self)var self=this;if(void 0===global)var global=self;var $m=self.$m=self.$m||{},$req;if(void 0===process)var process={browser:!0,env:{NODE_ENV:"test"}};self.require=self.require||function(e){if($m[e])return"function"==typeof $m[e]&&$m[e](),$m[e].exports},function(){$m.foo={exports:{}},$m.foo.exports="foo",$m.bar={exports:{}};var e=$m.foo.exports;$m.bar.exports=e}();//# sourceMappingURL=bar.js.map'
      );
      done();
    });
  });
  it('should build a minified js file if "compress" is true, preserving special comments', done => {
    buddy = buddyFactory(
      {
        input: 'comment.js',
        output: 'output'
      },
      { compress: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('/**\n * foo\n * https://github.com/foo\n * @copyright foo\n * @license MIT\n */');
      done();
    });
  });
  it('should build a non-bootstrapped js file if "bootstrap" is false', done => {
    buddy = buddyFactory({
      input: 'foo.js',
      output: 'output',
      bootstrap: false
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        "$m['foo'] = function () {\n/*== foo.js ==*/\n$m['foo'] = { exports: {} };\n$m['foo'].exports = 'foo';\n/*≠≠ foo.js ≠≠*/\n}"
      );
      done();
    });
  });
  it('should remove dead code when referencing "process.env.RUNTIME" and minifying', done => {
    buddy = buddyFactory(
      {
        input: 'zee.js',
        output: 'output'
      },
      { compress: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('$m.foo={exports:{}},$m.foo.exports="foo"');
      expect(content).to.not.contain('$m.c');
      done();
    });
  });
  it('should expose BUDDY_X_X to source files', done => {
    buddy = buddyFactory({
      input: 'env-2.js',
      output: 'output',
      label: 'env'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain("var env2__hash = '696768116e504ebcba3b436af9e645c9';");
      done();
    });
  });
  it('should build a node bundle when "version=node"', done => {
    buddy = buddyFactory({
      input: 'node.js',
      output: 'output',
      version: 'node'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain("var native__http = require('http');");
      expect(content).to.contain("var node__http = $m['native'].exports;");
      expect(content).to.contain("var node__runtime = 'server';");
      expect(content).to.contain('module.exports = function () {};');
      done();
    });
  });
  it.skip('should build a node bundle with inlined __dirname', done => {
    buddy = buddyFactory({
      input: 'node2.js',
      output: 'output',
      version: 'node'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');
      console.log(content);
      // expect(content).to.contain("join(require('path').resolve(''), 'node.js')");
      expect(eval(content)).to.be.ok();
      done();
    });
  });
  it('should build a node bundle with inlined env var when minifying', done => {
    buddy = buddyFactory(
      {
        input: 'node.js',
        output: 'output',
        version: 'node'
      },
      { compress: true, deploy: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('var native__http=require("http")');
      expect(content).to.contain('var node__http=$m.native.exports');
      expect(content).to.contain('node__runtime="browser"');
      expect(content).to.contain('node__prod="production"');
      expect(content).to.contain('module.exports=function(){};');
      done();
    });
  });
  it('should build a complex dependency tree', done => {
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
  it('should build a minified complex dependency tree', done => {
    buddy = buddyFactory(
      {
        input: 'lodash.js',
        output: 'output',
        version: 'node'
      },
      { compress: true, deploy: true }
    );
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(eval(content)).to.be.ok();
      done();
    });
  });
  it('should build a complex dependency tree with circular dependencies', done => {
    buddy = buddyFactory({
      input: 'babel.js',
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
  it('should build an es2016 browser version', done => {
    buddy = buddyFactory({
      input: 'comma.js',
      output: 'output',
      version: 'es2016'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('function comma__foo(a, b) {');
      done();
    });
  });
  it('should build an es2016 browser version with helpers', done => {
    buddy = buddyFactory({
      input: 'async.js',
      output: 'output',
      version: 'es2016'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('babelHelpers.asyncToGenerator = function (fn)');
      expect(content).to.contain('var _ref = babelHelpers.asyncToGenerator(function*');
      done();
    });
  });

  describe('packages', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/build/packages'));
    });
    after(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
    });

    it('should build a js file with node_modules dependencies', done => {
      buddy = buddyFactory({
        input: 'bat.js',
        output: 'output'
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain("$m['bar'].exports = 'bar';");
        expect(content).to.contain("var foo__bar = $m['bar'].exports;");
        expect(content).to.contain("var bat__foo = $m['foo'].exports");
        done();
      });
    });
    it('should build a js file with relative node_modules dependencies', done => {
      buddy = buddyFactory({
        input: 'boo.js',
        output: 'output'
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain("$m['bar/dist/commonjs/lib/bar'].exports = 'bar';");
        expect(content).to.contain("var boo__bar = $m['bar/dist/commonjs/lib/bar'].exports");
        done();
      });
    });
    it('should build a js file with node_modules dependencies with missing "main" reference', done => {
      buddy = buddyFactory({
        input: 'zong.js',
        output: 'output'
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain("$m['foo.js'].exports = 'foo.js';");
        done();
      });
    });
    it('should build a js file with json node_modules dependency', done => {
      buddy = buddyFactory({
        input: 'zing.js',
        output: 'output'
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain("var zing__boo = $m['boo'].exports;");
        expect(content).to.contain('var boo__json = {  "boo": "boo"}');
        done();
      });
    });
    it('should build a js file with disabled dependency', done => {
      buddy = buddyFactory({
        input: 'bong.js',
        output: 'output'
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain('var bong__bat = {};');
        done();
      });
    });
    it.skip('should build a node bundle with disabled dependency in third-party dependency', done => {
      buddy = buddyFactory({
        input: 'zing.js',
        output: 'output',
        version: 'node',
        resolve: {
          json: false
        }
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain('var booindexjs100__json = {};');
        expect(content).to.not.contain('"boo": "boo"');
        done();
      });
    });
    it.skip('should build a node bundle with disabled dependency in third-party dependency file', done => {
      buddy = buddyFactory({
        input: 'zang.js',
        output: 'output',
        version: 'node',
        resolve: {
          json: false
        }
      });
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain('var booboojs100__json = {};');
        expect(content).to.not.contain('"boo": "boo"');
        done();
      });
    });
  });
});