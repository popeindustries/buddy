'use strict';

const { unwrap } = require('../lib/plugins/js/concat');
const cache = require('../lib/cache');
const configFactory = require('../lib/config');
const expect = require('expect.js');
const File = require('../lib/File');
const fs = require('fs');
const path = require('path');
let config, file;

describe('file', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/file'));
  });
  beforeEach(() => {
    file = new File('foo', path.resolve('src/foo.js'), 'js', {});
  });
  afterEach(() => {
    if (config) config.destroy();
  });

  describe('constructor()', () => {
    it('should define file properties', () => {
      expect(file).to.have.property('extension', 'js');
      expect(file).to.have.property('relpath', 'src/foo.js');
      expect(file).to.have.property('name', 'foo.js');
    });
    it('should load file content', () => {
      expect(file).to.have.property('hash', 'af1c6f25496712c4303dc6a37b809bdf');
    });
  });

  describe('addDependencies()', () => {
    it('should ignore invalid dependency id', () => {
      file.addDependencies([{ id: './zoop' }], {});
      expect(file.dependencyReferences).to.have.length(0);
    });
    it('should disable dependency reference when watch only build', () => {
      const dependency = { id: 'bar' };

      file.addDependencies([dependency], { watchOnly: true });
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.have.length(0);
    });
    it('should disable dependency reference when disabled via package.json', () => {
      const dependency = { id: 'bat/boop' };

      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a parent file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        index.isLocked = true;
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a child file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], { ignoredFiles: [index.filepath] });
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should store dependant file instance', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies.includes(index)).to.eql(true);
    });
    it('should flag dependant file instance as inline if parsed as inline source', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index', stack: true };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies.includes(index)).to.eql(true);
      expect(index).to.have.property('isInline', true);
    });
  });

  describe('parseWorkflow()', () => {
    it('should return a simple set of workflows', () => {
      file.workflows = { foo: [['foo']], bar: [['bar']] };
      expect(file.parseWorkflow('foo', 0, {})).to.eql(file.workflows.foo[0]);
    });
    it('should return a conditional set of workflows', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('foo', 0, { compress: true, bundle: false })).to.eql(['foo']);
      expect(file.parseWorkflow('bar', 0, { compress: true, bundle: false })).to.eql(['bat']);
    });
    it('should return a conditional set of workflows, including negated condition', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['!bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('bar', 0, { compress: true, bundle: false })).to.eql(['bar', 'bat']);
    });
  });

  describe('runWorkflow()', () => {
    it('should run a default workflow', (done) => {
      file.parse = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.runWorkflow('standard', 0, {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a standard workflow, including for new dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/bar.js'), 'js', {});

      bar.parse = function (buildOptions, fn) {
        expect(file).to.have.property('foo', true);
        this.bar = true;
        fn();
      };
      file.parse = function (buildOptions, fn) {
        this.dependencies.push(bar);
        this.foo = true;
        fn();
      };
      file.runWorkflow('standard', 0, {}, (err) => {
        expect(bar).to.have.property('bar', true);
        done();
      });
    });
    it('should run a standard workflow, including for existing dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/bar.js'), 'js', {});

      file.dependencies.push(bar);
      file.workflows.standard[1] = bar.workflows.standard[1] = ['runWorkflowForDependencies', 'load', 'parse'];
      bar.parse = function (buildOptions, fn) {
        this.bar = true;
        fn();
      };
      file.parse = function (buildOptions, fn) {
        expect(bar).to.have.property('bar', true);
        this.foo = true;
        fn();
      };
      file.runWorkflow('standard', 1, {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
  });

  describe('run()', () => {
    it('should run a standard set of workflows', (done) => {
      file.parse = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.run('standard', {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a standard set of workflows, including for dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/foo.js'), 'js', {});

      bar.parse = function (buildOptions, fn) {
        expect(file).to.have.property('foo', true);
        this.bar = true;
        fn();
      };
      file.parse = function (buildOptions, fn) {
        this.dependencies.push(bar);
        this.foo = true;
        fn();
      };
      file.run('standard', {}, (err) => {
        expect(bar).to.have.property('bar', true);
        done();
      });
    });
    it('should run an extended standard set of workflows', (done) => {
      file.workflows.standard[1] = ['foo'];
      file.foo = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.run('standard', {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run an extended standard set of workflows, including for dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/bar.js'), 'js', {});

      file.workflows.standard[1] = ['runWorkflowForDependencies'];
      bar.workflows.standard[1] = ['bar'];
      bar.bar = function (buildOptions, fn) {
        expect(file).to.have.property('foo', true);
        this.bat = true;
        fn();
      };
      file.parse = function (buildOptions, fn) {
        this.dependencies.push(bar);
        this.foo = true;
        fn();
      };
      file.run('standard', {}, (err) => {
        expect(bar).to.have.property('bat', true);
        done();
      });
    });
  });

  describe('JSFile', () => {
    beforeEach(() => {
      config = configFactory({
        input: '.',
        output: '.'
      }, {});
      file = config.fileFactory(path.resolve('src/foo.js'), {
        fileCache: cache.createFileCache(),
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: {
          babel: {
            plugins: [
              require('babel-plugin-external-helpers'),
              require('babel-plugin-transform-es2015-function-name'),
              require('babel-plugin-transform-es2015-parameters'),
              [require('babel-plugin-transform-es2015-destructuring'), { loose: true }],
              [require('babel-plugin-transform-es2015-classes'), { loose: true }]
            ]
          }
        },
        runtimeOptions: config.runtimeOptions,
        webroot: path.resolve('www')
      });
    });

    describe('constructor()', () => {
      it('should flag npm module files', () => {
        process.chdir(path.resolve(__dirname, '..'));
        config.destroy();
        config = configFactory({
          input: 'foo.js',
          output: 'js'
        }, {});
        file = config.fileFactory(path.resolve('node_modules/async/series.js'), {
          fileCache: cache.createFileCache(),
          fileExtensions: config.fileExtensions,
          fileFactory: config.fileFactory,
          npmModulepaths: config.npmModulepaths,
          pluginOptions: { babel: { plugins: [] } },
          runtimeOptions: config.runtimeOptions
        });
        expect(file.isNpmModule).to.equal(true);
        process.chdir(path.resolve(__dirname, 'fixtures/file'));
      });
    });

    describe('parse()', () => {
      it('should store an array of require dependencies', (done) => {
        file.content = "var a = require('./a');\nvar b = require('./b');";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(2);
          done();
        });
      });
      it('should store an array of import dependencies', (done) => {
        file.content = "import barDefault from './a';";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of dynamic import dependencies', (done) => {
        file.content = "buddyImport('./a').then((module) => {})";
        file.parse({}, (err) => {
          expect(file.dynamicDependencyReferences).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        file.content = "var a = require('./a');\nvar b = require('./a');";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store 2 dependency objects when there are case sensitive package references', (done) => {
        file.content = "var a = require('./a');\nvar boo = require('Boo');";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(2);
          done();
        });
      });
    });

    describe('replaceEnvironment()', () => {
      it('should inline calls to process.env', (done) => {
        file.content = "process.env.NODE_ENV process.env['NODE_ENV'] process.env[\"NODE_ENV\"]";
        file.replaceEnvironment({}, (err) => {
          expect(file.content).to.eql("'test' 'test' 'test'");
          done();
        });
      });
      it('should inline calls to process.env.RUNTIME', (done) => {
        file.content = 'process.env.RUNTIME';
        file.replaceEnvironment({}, (err) => {
          expect(file.content).to.eql("'browser'");
          done();
        });
      });
      it('should handle undefined values when inlining calls to process.env', (done) => {
        file.content = 'process.env.FEATURE_FOO';
        file.replaceEnvironment({}, (err) => {
          expect(file.content).to.eql('process.env.FEATURE_FOO');
          done();
        });
      });
    });

    describe('replaceReferences()', () => {
      it('should replace relative ids with absolute ones', (done) => {
        file.content = "var foo = require('./foo');";
        file.dependencyReferences = [
          {
            id: './foo',
            context: "require('./foo')",
            file: { dependencyReferences: [], id: 'foo.js' },
            isIgnored: true
          }
        ];
        file.replaceReferences({}, (err) => {
          expect(file.content).to.eql("var foo = require('foo.js');");
          done();
        });
      });
      it('should replace "require(*)" with resolved lookup', (done) => {
        file.content = "var foo = require('./foo');";
        file.dependencyReferences = [
          {
            id: './foo',
            context: "require('./foo')",
            file: { dependencyReferences: [], id: 'foo.js' }
          }
        ];
        file.replaceReferences({}, (err) => {
          expect(file.content).to.eql("var foo = $m['foo.js'].exports;");
          done();
        });
      });
      it('should replace package ids with versioned ones', (done) => {
        file.content = "var bar = require('bar');\nvar baz = require('view/baz');";
        file.dependencyReferences = [
          {
            id: 'bar',
            context: "require('bar')",
            file: { dependencyReferences: [], id: 'bar@0.js' }
          },
          {
            id: 'view/baz',
            context: "require('view/baz')",
            file: { dependencyReferences: [], id: 'view/baz.js' }
          }
        ];
        file.replaceReferences({}, (err) => {
          expect(file.content).to.eql("var bar = $m['bar@0.js'].exports;\nvar baz = $m['view/baz.js'].exports;");
          done();
        });
      });
    });

    describe('replaceDynamicReferences()', () => {
      it('should replace relative id with url+id', (done) => {
        file.content = "buddyImport('./a.js')";
        file.writepath = path.resolve('www/assets/js', 'foo.js');
        file.dynamicDependencyReferences = [
          {
            id: './a.js',
            context: "buddyImport('./a.js')",
            file: { filepath: path.resolve('src/a.js'), id: 'a', writeUrl: '/assets/js/a.js' }
          }
        ];
        file.replaceDynamicReferences({ browser: true }, (err) => {
          expect(file.content).to.equal("buddyImport('/assets/js/a.js', 'a')");
          done();
        });
      });
      it('should replace relative id with url+id with correct quote style', (done) => {
        file.content = 'buddyImport("./a.js")';
        file.writepath = path.resolve('www/assets/js', 'foo.js');
        file.dynamicDependencyReferences = [
          {
            id: './a.js',
            context: 'buddyImport("./a.js")',
            file: { filepath: path.resolve('src/a.js'), id: 'a', writeUrl: '/assets/js/a.js' }
          }
        ];
        file.replaceDynamicReferences({ browser: true }, (err) => {
          expect(file.content).to.equal('buddyImport("/assets/js/a.js", "a")');
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should inline require(*.json) content', (done) => {
        file.content = "var foo = require('./foo.json');";
        file.dependencyReferences = [
          {
            file: {
              filepath: path.resolve('./foo.json'),
              extension: 'json',
              type: 'json',
              content: fs.readFileSync(path.resolve('./src/foo.json'), 'utf8'),
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './foo.json',
            context: "require('./foo.json')",
            id: './foo.json'
          }
        ];
        file.inline({}, (err) => {
          expect(file.content).to.eql('var foo = {\n\t"foo": "bar"\n};');
          done();
        });
      });
      it('should inline an empty object when unable to locate require(*.json) content', (done) => {
        file.content = "var foo = require('./bar.json');";
        file.dependencyReferences = [
          {
            file: {
              filepath: path.resolve('./bar.json'),
              extension: 'json',
              type: 'json',
              content: '',
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './bar.json',
            context: "require('./bar.json')",
            id: './bar.json'
          }
        ];
        file.inline({}, (err) => {
          expect(file.content).to.eql('var foo = {};');
          done();
        });
      });
      it('should inline an empty object when dependency is a native module', (done) => {
        file.content = "var foo = require('path');";
        file.dependencyReferences = [
          {
            filepath: 'path',
            context: "require('path')",
            id: 'path',
            isDisabled: true
          }
        ];
        file.inline({ browser: true }, (err) => {
          expect(file.content).to.eql('var foo = {};');
          done();
        });
      });
      it('should not inline an empty object when dependency is a native module for server builds', (done) => {
        file.content = "var foo = require('path');";
        file.dependencyReferences = [
          {
            filepath: 'path',
            context: "require('path')",
            id: 'path',
            isDisabled: false
          }
        ];
        file.inline({ browser: false }, (err) => {
          expect(file.content).to.eql("var foo = require('path');");
          done();
        });
      });
    });

    describe('transpile()', () => {
      describe('namespace root declarations', () => {
        it('should namespace variable declarations', (done) => {
          file.content = 'const foo = "foo";';
          file.transpile({ bundle: true }, (err) => {
            expect(file.content).to.equal('const srcfoo__foo = "foo";');
            done();
          });
        });
        it('should namespace function declarations', (done) => {
          file.content = 'function foo () {}';
          file.transpile({ bundle: true }, (err) => {
            expect(file.content).to.equal('function srcfoo__foo() {}');
            done();
          });
        });
        it('should namespace class declarations', (done) => {
          file.content = 'class Foo {}';
          file.transpile({ bundle: true }, (err) => {
            expect(file.content).to.contain('let srcfoo__Foo = function srcfoo__Foo() {');
            done();
          });
        });
        it('should namespace all declarations and their references', (done) => {
          file.content = fs.readFileSync('src/namespace.js', 'utf8');
          file.transpile({ bundle: true }, (err) => {
            expect(file.content).to.equal('const srcfoo__bar = require(\'bar\');\nconst srcfoo__Bar = require(\'Bar\');\nlet srcfoo__foo = require(\'./foo\');\nvar srcfoo__boo;\n\nconsole.log(srcfoo__foo, srcfoo__bar);\n\nsrcfoo__foo = srcfoo__bar;\nsrcfoo__foo && \'zoo\';\nvar srcfoo__baz = srcfoo__foo.baz;\nvar srcfoo__boo = {};\nsrcfoo__boo[srcfoo__baz] = \'baz\';\n\nlet srcfoo__Foo = function (_srcfoo__Bar) {\n  babelHelpers.inherits(srcfoo__Foo, _srcfoo__Bar);\n\n  function srcfoo__Foo() {\n    babelHelpers.classCallCheck(this, srcfoo__Foo);\n\n    var _this = babelHelpers.possibleConstructorReturn(this, _srcfoo__Bar.call(this));\n\n    _this.foo = srcfoo__foo;\n    console.log(srcfoo__foo);\n    return _this;\n  }\n\n  srcfoo__Foo.prototype.bar = function bar() {\n    srcfoo__foo();\n  };\n\n  return srcfoo__Foo;\n}(srcfoo__Bar);\n\nfunction srcfoo__bat(foo) {\n  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n\n  const f = new srcfoo__Foo();\n\n  console.log(f, foo, srcfoo__bar, \'bat\', options);\n}\n\nfor (let foo = 0; foo < 3; foo++) {\n  srcfoo__bat(foo);\n  console.log(srcfoo__bar);\n}\n\nzip = {\n  foo: srcfoo__foo\n};\n\nfunction srcfoo__y() {\n  for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {\n    rest[_key] = arguments[_key];\n  }\n\n  console.log(rest);\n}\n\nvar srcfoo__units = {};\n\nvar srcfoo__z = function srcfoo__z() {\n  var params = {\n    units: function units(v) {\n      if (srcfoo__units[v]) {\n        var t = srcfoo__units[v].t;\n      }\n    }\n  };\n};\n\nvar srcfoo__zing;\n\nif (true) {\n  srcfoo__zing = \'zing\';\n}\n\nvar srcfoo___require = require(\'c\'),\n    srcfoo__a = srcfoo___require.a,\n    srcfoo__b = srcfoo___require.b;\n\nfunction srcfoo__S() {\n  Object.assign(srcfoo__S.prototype, { foo: srcfoo__foo });\n\n  if (true) {\n    srcfoo__S = new Proxy(srcfoo__S, {});\n  }\n}\n\nif (true) {\n  var srcfoo__t = {};\n  let u;\n  srcfoo__t.foo = \'c\';\n}');
            done();
          });
        });
      });

      describe('replace module/exports', () => {
        it('should replace "module.exports"', (done) => {
          file.content = 'module.exports = function foo() {};';
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo'].exports = function foo() {};");
            done();
          });
        });
        it('should replace "module[\'exports\']"', (done) => {
          file.content = 'module[\'exports\'] = function foo() {};';
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo']['exports'] = function foo() {};");
            done();
          });
        });
        it('should replace "module.exports.*"', (done) => {
          file.content = 'module.exports.foo = function foo() {};';
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo'].exports.foo = function foo() {};");
            done();
          });
        });
        it('should replace "module.exports[\'*\']"', (done) => {
          file.content = "module.exports['foo'] = function foo() {};";
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo'].exports['foo'] = function foo() {};");
            done();
          });
        });
        it('should replace "exports.*"', (done) => {
          file.content = "exports.foo = 'foo';";
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo'].exports.foo = 'foo';");
            done();
          });
        });
        it('should replace "exports[\'*\']"', (done) => {
          file.content = "exports['foo'] = 'foo';";
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m['src/foo'].exports['foo'] = 'foo';");
            done();
          });
        });
        it('should replace all "module" and "exports"', (done) => {
          file.content = fs.readFileSync('src/module.js', 'utf8');
          file.transpile({ browser: true, bundle: true }, (err) => {
            expect(file.content).to.equal("$m[\'src/foo\'].exports = {};\n$m[\'src/foo\'][\'exports\'] = {};\n$m[\'src/foo\'][\'ex\' + \'ports\'] = {};\n\n$m[\'src/foo\'].exports.foo = \'foo\';\n$m[\'src/foo\'].exports[\'foo\'] = \'foo\';\n$m[\'src/foo\'].exports.BELL = \'\\x07\';\n\nvar srcfoo__freeExports = typeof $m[\'src/foo\'].exports == \'object\' && $m[\'src/foo\'].exports && !$m[\'src/foo\'].exports.nodeType && $m[\'src/foo\'].exports;\nvar srcfoo__freeModule = srcfoo__freeExports && typeof $m[\'src/foo\'] == \'object\' && $m[\'src/foo\'] && !$m[\'src/foo\'].nodeType && $m[\'src/foo\'];\n\nif (true) {\n  const module = \'foo\';\n  const exports = \'bar\';\n\n  exports.foo = \'foo\';\n}\nfoo[$m[\'src/foo\'].exports.foo] = \'foo\';");
            done();
          });
        });
      });
    });

    describe('concat()', () => {
      describe('unwrap()', () => {
        it('should unwrap file contents', () => {
          file.content = fs.readFileSync(path.resolve('src/wrapped.js'), 'utf8');
          file.id = 'wrapped.js';
          const content = unwrap(file);

          expect(content).to.equal('(function () {\n/*== b.js ==*/\n$m[\'b.js\'] = function () {\n$m[\'b.js\'] = { exports: {} };\n$m[\'b.js\'].exports = _bjs_b;\n\nvar _bjs_a = require(\'a.js\');\n\nfunction _bjs_b() {\n  console.log(\'b\');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n/*== a.js ==*/\n$m[\'a.js\'] = function () {\n$m[\'a.js\'] = { exports: {} };\n$m[\'a.js\'].exports = _ajs_a;\n\nvar _ajs_b = require(\'b.js\');\n\nfunction _ajs_a() {\n  console.log(\'a\');\n}\n};\n/*≠≠ a.js ≠≠*/\n\n/*== wrapped.js ==*/\n$m[\'wrapped.js\'] = { exports: {} };\nvar _wrappedjs_a = require(\'a.js\');\n/*≠≠ wrapped.js ≠≠*/\n})()\n');
        });
        it('should unwrap node file contents', () => {
          file.content = fs.readFileSync(path.resolve('src/wrapped.js'), 'utf8');
          file.id = 'wrapped-node.js';
          const content = unwrap(file);

          expect(content).to.equal('(function () {\n/*== b.js ==*/\n$m[\'b.js\'] = function () {\n$m[\'b.js\'] = { exports: {} };\n$m[\'b.js\'].exports = _bjs_b;\n\nvar _bjs_a = require(\'a.js\');\n\nfunction _bjs_b() {\n  console.log(\'b\');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n/*== a.js ==*/\n$m[\'a.js\'] = function () {\n$m[\'a.js\'] = { exports: {} };\n$m[\'a.js\'].exports = _ajs_a;\n\nvar _ajs_b = require(\'b.js\');\n\nfunction _ajs_a() {\n  console.log(\'a\');\n}\n};\n/*≠≠ a.js ≠≠*/\n\n/*== wrapped.js ==*/\n$m[\'wrapped-node.js\'] = $m[\'wrapped.js\'] = { exports: {} };\nvar _wrappedjs_a = require(\'a.js\');\n/*≠≠ wrapped.js ≠≠*/\n})()\n');
        });
      });
    });
  });

  describe('CSSFile', () => {
    beforeEach(() => {
      config = configFactory({
        input: 'src/js/main.css',
        output: 'css'
      }, {});
      file = config.fileFactory(path.resolve('src/main.css'), {
        fileCache: cache.createFileCache(),
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        runtimeOptions: config.runtimeOptions
      });
    });

    describe('parse()', () => {
      it('should store an array of dependencies', (done) => {
        file.content = "@import 'main';";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        file.content = "@import 'main'; @import 'main';";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should replace @import rules with file contents', (done) => {
        file.content = "@import 'foo';\nbody {\n\tbackground-color: black;\n}";
        file.dependencyReferences = [
          {
            file: {
              filepath: 'foo',
              extension: 'css',
              type: 'css',
              content: 'div {\n\twidth: 50%;\n}\n',
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './foo.css',
            context: "@import 'foo';",
            id: 'foo'
          }
        ];
        file.inline({}, (err) => {
          expect(file.content).to.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
          done();
        });
      });
      it('should replace @import rules with file contents, allowing duplicates', (done) => {
        file.content = "@import 'foo';\n@import 'foo';";
        file.dependencyReferences = [
          {
            file: {
              filepath: 'foo',
              extension: 'css',
              type: 'css',
              content: 'div {\n\twidth: 50%;\n}\n',
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './foo.css',
            context: "@import 'foo';",
            id: 'foo'
          }
        ];
        file.inline({}, (err) => {
          expect(file.content).to.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
          done();
        });
      });
    });
  });

  describe('HTMLFile', () => {
    beforeEach(() => {
      config = configFactory({
        input: 'src/js/main.html',
        output: 'html'
      }, {});
      file = config.fileFactory(path.resolve('src/main.html'), {
        fileCache: cache.createFileCache(),
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        runtimeOptions: config.runtimeOptions
      });
    });

    describe('parse()', () => {
      it('should store an array of "inline" dependency references', (done) => {
        file.content = '<script inline src="foo.js"></script>';
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          expect(file.dependencies[0]).to.have.property('isInline', true);
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should replace "inline" source with file contents', (done) => {
        file.content = '<script inline src="foo.js"></script>';
        file.parse({}, (err) => {
          file.inline({}, (err) => {
            expect(file.content).to.equal('<script>module.exports="foo";</script>');
            done();
          });
        });
      });
      it('should replace "inline" source with processed file contents', (done) => {
        file.content = '<script inline src="bat.js"></script>';
        file.parse({}, (err) => {
          file.inline({}, (err) => {
            expect(file.content).to.equal('<script>var runtime="browser";</script>');
            done();
          });
        });
      });
    });
  });
});