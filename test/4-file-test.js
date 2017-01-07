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
    file = new File('foo', path.resolve('src/foo.js'), 'js', {
      browser: true,
      fileFactory: () => {
        return { isLocked: false };
      },
      runtimeOptions: { maps: true }
    });
  });
  afterEach(() => {
    cache.clear();
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

  describe('appendContent()', () => {
    it('should append a text chunk', () => {
      file.appendContent('var bar = "bar";');
      expect(file.content).to.equal('module.exports = \'foo\';\nvar bar = "bar";');
      expect(file.totalLines).to.equal(2);
    });
    it('should append a multiline text chunk', () => {
      file.appendContent('var bar = "bar";\nvar foo = "foo";');
      expect(file.content).to.equal('module.exports = \'foo\';\nvar bar = "bar";\nvar foo = "foo";');
      expect(file.totalLines).to.equal(3);
    });
    it('should append a file chunk', () => {
      const file2 = new File('bat', path.resolve('src/bat.js'), 'js', { runtimeOptions: { maps: true } });

      file.appendContent(file2);
      expect(file.content).to.equal('module.exports = \'foo\';\nvar runtime = process.env.RUNTIME;');
      expect(file.totalLines).to.equal(2);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;ACAA');
    });
    it('should append a multiline file chunk', () => {
      const file2 = new File('bar', path.resolve('src/bar.js'), 'js', { runtimeOptions: { maps: true } });

      file.appendContent(file2);
      expect(file.content).to.equal('module.exports = \'foo\';\nvar foo = require(\'./foo\');\n\nmodule.exports = \'bar\';');
      expect(file.totalLines).to.equal(4);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;ACAA;;AAEA');
    });
  });

  describe('prependContent()', () => {
    it('should prepend a text chunk', () => {
      file.prependContent('var bar = "bar";');
      expect(file.content).to.equal('var bar = "bar";\nmodule.exports = \'foo\';');
      expect(file.totalLines).to.equal(2);
    });
    it('should prepend a multiline text chunk', () => {
      file.prependContent('var bar = "bar";\nvar foo = "foo";');
      expect(file.content).to.equal('var bar = "bar";\nvar foo = "foo";\nmodule.exports = \'foo\';');
      expect(file.totalLines).to.equal(3);
    });
    it('should prepend a file chunk', () => {
      const file2 = new File('bat', path.resolve('src/bat.js'), 'js', { runtimeOptions: { maps: true } });

      file.prependContent(file2);
      expect(file.content).to.equal('var runtime = process.env.RUNTIME;\nmodule.exports = \'foo\';');
      expect(file.totalLines).to.equal(2);
      expect(file.map.toJSON()).to.have.property('mappings', 'ACAA;ADAA');
    });
    it('should prepend a multiline file chunk', () => {
      const file2 = new File('bar', path.resolve('src/bar.js'), 'js', { runtimeOptions: { maps: true } });

      file.prependContent(file2);
      expect(file.content).to.equal('var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';\nmodule.exports = \'foo\';');
      expect(file.totalLines).to.equal(4);
      expect(file.map.toJSON()).to.have.property('mappings', 'ACAA;;AAEA;ADFA');
    });
  });

  describe('replaceContent()', () => {
    it('should replace a text string with content', () => {
      file.replaceContent('foo', 18, 'bar');
      expect(file.content).to.equal('module.exports = \'bar\';');
    });
    it('should replace a text string with multiline content', () => {
      file.replaceContent('foo', 18, 'bar\nfoo');
      expect(file.content).to.equal('module.exports = \'bar\nfoo\';');
    });
    it('should replace a text string with file content', () => {
      const file2 = new File('bat', path.resolve('src/bat.js'), 'js', { runtimeOptions: { maps: true } });

      file.replaceContent("'foo'", 17, file2);
      expect(file.content).to.equal('module.exports = var runtime = process.env.RUNTIME;;');
    });
    it('should replace a text string with file content', () => {
      const file2 = new File('bat', path.resolve('src/bar.js'), 'js', { runtimeOptions: { maps: true } });

      file.replaceContent("'foo'", 17, file2);
      expect(file.content).to.equal('module.exports = var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';;');
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

      file.addDependencies([dependency], { });
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a parent file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        index.isLocked = true;
        return index;
      };
      file.addDependencies([dependency], { });
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a child file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], { ignoredFiles: [index.filepath] });
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should store dependant file instance', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies.includes(index)).to.eql(true);
    });
    it('should flag dependant file instance as inline if parsed as inline source', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
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
      expect(file.parseWorkflow('foo', {})).to.eql(file.workflows.foo[0]);
    });
    it('should return a conditional set of workflows', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('foo', { compress: true, bundle: false })).to.eql(['foo']);
      expect(file.parseWorkflow('bar', { compress: true, bundle: false })).to.eql(['bat']);
    });
    it('should return a conditional set of workflows, including negated condition', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['!bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('bar', { compress: true, bundle: false })).to.eql(['bar', 'bat']);
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
      const bar = new File('bar', path.resolve('src/foo.js'), 'js', { runtimeOptions: {} });

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

  });

  describe('JSFile', () => {
    function create (filepath) {
      const caches = cache.createCaches();

      return config.fileFactory(path.resolve(filepath), {
        fileCache: caches.fileCache,
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
        resolverCache: caches.resolverCache,
        runtimeOptions: config.runtimeOptions,
        webroot: path.resolve('www')
      });
    }

    beforeEach(() => {
      config = configFactory({
        input: '.',
        output: '.'
      }, {});
      file = create('src/foo.js');
    });

    describe('constructor()', () => {
      it('should flag npm module files', () => {
        process.chdir(path.resolve(__dirname, '..'));
        config.destroy();

        const caches = cache.createCaches();

        config = configFactory({
          input: 'foo.js',
          output: 'js'
        }, {});
        file = config.fileFactory(path.resolve('node_modules/async/series.js'), {
          fileCache: caches.fileCache,
          fileExtensions: config.fileExtensions,
          fileFactory: config.fileFactory,
          npmModulepaths: config.npmModulepaths,
          pluginOptions: { babel: { plugins: [] } },
          resolverCache: caches.resolverCache,
          runtimeOptions: config.runtimeOptions
        });
        expect(file.isNpmModule).to.equal(true);
        process.chdir(path.resolve(__dirname, 'fixtures/file'));
      });
    });

    describe('parse()', () => {
      it('should store an array of require dependencies', (done) => {
        file.content = "var a = require('./a');\nvar b = require('./b');";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(2);
          done();
        });
      });
      it('should store an array of import dependencies', (done) => {
        file.content = "import barDefault from './a';";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of dynamic import dependencies', (done) => {
        file.content = "buddyImport('./a').then((module) => {})";
        file.parse({ bundle: true }, (err) => {
          expect(file.dynamicDependencyReferences).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        file.content = "var a = require('./a');\nvar b = require('./a');";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store 2 dependency objects when there are case sensitive package references', (done) => {
        file.content = "var a = require('./a');\nvar boo = require('Boo');";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(2);
          done();
        });
      });
      it('should flag file if unresolvable dependencies', (done) => {
        file.content = "var a = require('a' + '.js');";
        file.parse({ bundle: true }, (err) => {
          expect(file.hasUnresolvedDependencies).to.equal(true);
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
      it('should inline calls to process.browser', (done) => {
        file.content = 'process.browser;\nvar foo = process.browser;\n';
        file.replaceEnvironment({}, (err) => {
          expect(file.content).to.eql('true;\nvar foo = true;\n');
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
          expect(file.content).to.eql('var foo = {  "foo": "bar"};');
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
            file: { content: '', dependencyReferences: [], id: 'foo.js', setContent: (content) => {} }
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
            file: { content: '', dependencyReferences: [], id: 'bar@0.js', setContent: (content) => {} }
          },
          {
            id: 'view/baz',
            context: "require('view/baz')",
            file: { content: '', dependencyReferences: [], id: 'view/baz.js', setContent: (content) => {} }
          }
        ];
        file.replaceReferences({}, (err) => {
          expect(file.content).to.eql("var bar = $m['bar@0.js'].exports;\nvar baz = $m['view/baz.js'].exports;");
          done();
        });
      });
    });

    describe('rewriteDirnameFilename()', () => {
      it('should rewrite "__dirname"', (done) => {
        file.content = "path.join(__dirname, 'foo.js')";
        file.writepath = path.resolve('output/foo.js');
        file.rewriteDirnameFilename({}, (err) => {
          expect(file.content).to.equal("path.join(require('path').resolve('../src'), 'foo.js')");
          done();
        });
      });
      it('should rewrite "__filname"', (done) => {
        file.content = "console.log(__filename)";
        file.writepath = path.resolve('output/foo.js');
        file.rewriteDirnameFilename({}, (err) => {
          expect(file.content).to.equal("console.log(require('path').resolve('../src/foo.js'))");
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
            file: { content: '', filepath: path.resolve('src/a.js'), id: 'a', writeUrl: '/assets/js/a.js' }
          }
        ];
        file.replaceDynamicReferences({ browser: true }, (err) => {
          expect(file.content).to.equal("buddyImport('/assets/js/a.js', 'a')");
          done();
        });
      });
      it('should rename "import()" to "buddyImport()"', (done) => {
        file.content = "import('./a.js')";
        file.writepath = path.resolve('www/assets/js', 'foo.js');
        file.dynamicDependencyReferences = [
          {
            id: './a.js',
            context: "import('./a.js')",
            file: { content: '', filepath: path.resolve('src/a.js'), id: 'a', writeUrl: '/assets/js/a.js' }
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
            file: { content: '', filepath: path.resolve('src/a.js'), id: 'a', writeUrl: '/assets/js/a.js' }
          }
        ];
        file.replaceDynamicReferences({ browser: true }, (err) => {
          expect(file.content).to.equal('buddyImport("/assets/js/a.js", "a")');
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
          const content = unwrap(fs.readFileSync(path.resolve('src/wrapped.js'), 'utf8'), 'wrapped');

          expect(content).to.equal('(function () {\n/*== b.js ==*/\n$m[\'b\'] = function () {\n$m[\'b\'] = { exports: {} };\n$m[\'b\'].exports = _b_b;\n\nvar _b_a = require(\'a\');\n\nfunction _b_b() {\n  console.log(\'b\');\n}\n};\n/*≠≠ b.js ≠≠*/\n\n/*== a.js ==*/\n$m[\'a\'] = function () {\n$m[\'a\'] = { exports: {} };\n$m[\'a\'].exports = _a_a;\n\nvar _a_b = require(\'b\');\n\nfunction _a_a() {\n  console.log(\'a\');\n}\n};\n/*≠≠ a.js ≠≠*/\n\n/*== wrapped.js ==*/\n$m[\'wrapped\'] = { exports: {} };\nvar _wrapped_a = require(\'a\');\n/*≠≠ wrapped.js ≠≠*/\n})()');
        });
      });
    });
  });

  describe('CSSFile', () => {
    beforeEach(() => {
      const caches = cache.createCaches();

      config = configFactory({
        input: 'src/js/main.css',
        output: 'css'
      }, {});
      file = config.fileFactory(path.resolve('src/main.css'), {
        fileCache: caches.fileCache,
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        resolverCache: caches.resolverCache,
        runtimeOptions: config.runtimeOptions
      });
    });

    describe('parse()', () => {
      it('should store an array of dependencies', (done) => {
        file.content = "@import 'main';";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        file.content = "@import 'main'; @import 'main';";
        file.parse({ bundle: true }, (err) => {
          expect(file.dependencies).to.have.length(1);
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should replace @import rules with file contents', (done) => {
        file.content = "@import 'foo';\nbody {\n\tbackground-color: black;\n}";
        file.totalLines = 4;
        file.dependencyReferences = [
          {
            file: {
              filepath: 'foo',
              extension: 'css',
              type: 'css',
              content: 'div {\n\twidth: 50%;\n}\n',
              dependencies: [],
              dependencyReferences: [],
              totalLines: 3
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
        file.content = "@import 'foo';\n@import 'foo';\n\n@import 'foo';";
        file.totalLines = 2;
        file.dependencyReferences = [
          {
            file: {
              filepath: 'foo',
              extension: 'css',
              type: 'css',
              content: 'div {\n\twidth: 50%;\n}\n',
              dependencies: [],
              dependencyReferences: [],
              totalLines: 3
            },
            filepath: './foo.css',
            context: "@import 'foo';",
            id: 'foo'
          }
        ];
        file.inline({}, (err) => {
          expect(file.content).to.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n\n\ndiv {\n\twidth: 50%;\n}\n');
          done();
        });
      });
    });
  });

  describe('HTMLFile', () => {
    beforeEach(() => {
      const caches = cache.createCaches();

      config = configFactory({
        input: 'src/js/main.html',
        output: 'html'
      }, {});
      file = config.fileFactory(path.resolve('src/main.html'), {
        fileCache: caches.fileCache,
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        resolverCache: caches.resolverCache,
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
  });
});