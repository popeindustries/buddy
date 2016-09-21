'use strict';

const configFactory = require('../lib/config');
const expect = require('expect.js');
const File = require('../lib/File');
const fs = require('fs');
const path = require('path');
let config, file, files;

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
      expect(file.dependencyReferences).to.eql([]);
    });
    it('should disable dependency reference when watch only build', () => {
      const dependency = { id: 'bar' };

      file.addDependencies([dependency], { watchOnly: true });
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.eql([]);
    });
    it('should disable dependency reference when disabled via package.json', () => {
      const dependency = { id: 'bat/boop' };

      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.eql([]);
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
      expect(file.dependencies).to.eql([]);
    });
    it('should ignore dependency reference when it is a circular reference', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        index.dependencies = [file];
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.eql([]);
    });
    it('should ignore dependency reference when it is a child file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], { ignoredFiles: [index.filepath] });
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.eql([]);
    });
    it('should store dependant file instance', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index' };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.eql([index]);
    });
    it('should flag dependant file instance as inline if parsed as inline source', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', {});
      const dependency = { id: './index', stack: true };

      file.options.fileFactory = function () {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.eql([index]);
      expect(index).to.have.property('isInline', true);
    });
  });

  describe('getAllDependencies()', () => {
    beforeEach(() => {
      files = {
        a: new File('a', path.resolve('src/a.js'), 'js', {}),
        b: new File('b', path.resolve('src/b.js'), 'js', {}),
        c: new File('c', path.resolve('src/c.js'), 'js', {}),
        d: new File('d', path.resolve('src/d.js'), 'js', {})
      };
    });

    it('should return an array of dependencies', () => {
      files.a.dependencies = [files.b, files.c];
      file.dependencies = [files.a];
      const deps = file.getAllDependencies(false);

      expect(deps.map((dep) => dep.id).join('')).to.equal('cba');
    });
    it('should return an array of unique dependencies', () => {
      files.a.dependencies = [files.b, files.c];
      files.c.dependencies = [files.b];
      file.dependencies = [files.a];
      const deps = file.getAllDependencies(false);

      expect(deps.map((dep) => dep.id).join('')).to.equal('bca');
    });
    it('should return an array of unique dependencies, avoiding circular dependencies', () => {
      files.a.dependencies = [files.b, files.c];
      files.c.dependencies = [files.a];
      file.dependencies = [files.a];
      const deps = file.getAllDependencies(false);

      expect(deps.map((dep) => dep.id).join('')).to.equal('cba');
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
        input: 'src/js/foo.js',
        output: 'js'
      }, {});
      file = config.fileFactory(path.resolve('src/foo.js'), {
        caches: config.caches,
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        runtimeOptions: config.runtimeOptions,
        sources: [path.resolve('src')]
      });
    });

    describe('parse()', () => {
      it('should store an array of dependencies', (done) => {
        file.content = "var a = require('./a');\nvar b = require('./b');";
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(2);
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
    });

    describe('transpile()', () => {
      it('should namespace root declarations when bundling', (done) => {
        file.content = 'const foo = "foo";';
        file.id = 'lib/_- \\foo.js';
        file.transpile({ bundle: true }, (err) => {
          expect(file.content).to.equal('const _libfoojs_foo = "foo";');
          done();
        });
      });
      it('should track global helpers');
    });
  });

  describe('CSSFile', () => {
    beforeEach(() => {
      config = configFactory({
        input: 'src/js/main.css',
        output: 'css'
      }, {});
      file = config.fileFactory(path.resolve('src/main.css'), {
        caches: config.caches,
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        runtimeOptions: config.runtimeOptions,
        sources: [path.resolve('src')]
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
        caches: config.caches,
        fileExtensions: config.fileExtensions,
        fileFactory: config.fileFactory,
        pluginOptions: { babel: { plugins: [] } },
        runtimeOptions: config.runtimeOptions,
        sources: [path.resolve('src')]
      });
    });

    describe('parse()', () => {
      it('should store an array of "inline" dependency references', (done) => {
        file.content = '<script inline src="src/foo.js"></script>';
        file.parse({}, (err) => {
          expect(file.dependencies).to.have.length(1);
          expect(file.dependencies[0]).to.have.property('isInline', true);
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should replace "inline" source with file contents', (done) => {
        file.content = '<script inline src="src/foo.js"></script>';
        file.parse({}, (err) => {
          file.inline({}, (err) => {
            expect(file.content).to.equal("<script>module.exports = 'foo';</script>");
            done();
          });
        });
      });
      it('should replace "inline" source with processed file contents', (done) => {
        file.content = '<script inline src="src/bat.js"></script>';
        file.parse({}, (err) => {
          file.inline({}, (err) => {
            expect(file.content).to.equal("<script>var runtime = 'browser';</script>");
            done();
          });
        });
      });
    });
  });



  describe.skip('workflow--', () => {
    describe('replaceReferences()', () => {
      it('should replace relative ids with absolute ones', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "var foo = require('./foo');";
        instance.dependencyReferences = [
          {
            filepath: './foo.js',
            match: "require('./foo')",
            instance: { id: 'foo.js' }
          }
        ];
        instance.replaceReferences({}, (err) => {
          expect(instance.content).to.eql("var foo = _m_['foo.js'];");
          done();
        });
      });
      it('should replace relative html include paths with absolute ones', (done) => {
        const instance = fileFactory(path.resolve('src/main.dust'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = '{>foo /}';
        instance.dependencyReferences = [
          {
            filepath: 'foo',
            match: '{>foo ',
            instance: { filepath: path.resolve('src/foo.dust') }
          }
        ];
        instance.replaceReferences({}, (err) => {
          expect(instance.content).to.eql('{>' + path.resolve('src/foo.dust') + ' /}');
          done();
        });
      });
      it('should replace relative html inline paths with absolute ones', (done) => {
        const instance = fileFactory(path.resolve('src/main.dust'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = '<script inline src="./main.js"></script>';
        instance.dependencyReferences = [
          {
            filepath: 'main.js',
            match: '<script inline src="./main.js"></script>',
            stack: [],
            instance: { filepath: path.resolve('src/main.js') }
          }
        ];
        instance.replaceReferences({}, (err) => {
          expect(instance.dependencyReferences[0].filepath).to.eql(path.resolve('src/main.js'));
          done();
        });
      });
      it('should replace package ids with versioned ones', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "var bar = require('bar');\nvar baz = require('view/baz');";
        instance.dependencyReferences = [
          {
            filepath: 'bar',
            match: "require('bar')",
            instance: { id: 'bar@0' }
          },
          {
            filepath: 'view/baz',
            match: "require('view/baz')",
            instance: { id: 'view/baz' }
          }
        ];
        instance.replaceReferences({}, (err) => {
          expect(instance.content).to.eql("var bar = _m_['bar@0'];\nvar baz = _m_['view/baz'];");
          done();
        });
      });
    });
  });
});