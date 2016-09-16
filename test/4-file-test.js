'use strict';

const expect = require('expect.js');
const File = require('../lib/File');
const fs = require('fs');
const path = require('path');
let file, files;

describe('file', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/file'));
  });
  beforeEach(() => {
    file = new File('foo', path.resolve('src/foo.js'), 'js', {});
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

  describe('getWorkflows()', () => {
    it('should return a simple set of workflows', () => {
      file.workflows = { foo: ['foo'], bar: ['bar'] };
      expect(file.getWorkflows({})).to.eql(file.workflows);
    });
    it('should return a conditional set of workflows', () => {
      file.workflows = { foo: ['compress:foo'], bar: ['bundle:compress:bar', 'bat'] };
      expect(file.getWorkflows({ compress: true, bundle: false })).to.eql({ foo: ['foo'], bar: ['bat'] });
    });
    it('should return a conditional set of workflows, including negated condition', () => {
      file.workflows = { foo: ['compress:foo'], bar: ['!bundle:compress:bar', 'bat'] };
      expect(file.getWorkflows({ compress: true, bundle: false })).to.eql({ foo: ['foo'], bar: ['bar', 'bat'] });
    });
  });

  describe('runWorkflow()', () => {
    it('should run a default workflow', (done) => {
      file.parse = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.runWorkflow('default', {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a default workflow, including for new dependencies', (done) => {
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
      file.runWorkflow('default', {}, (err) => {
        expect(bar).to.have.property('bar', true);
        done();
      });
    });
    it('should run a default workflow, including for existing dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/bar.js'), 'js', {});

      file.dependencies.push(bar);
      bar.parse = function (buildOptions, fn) {
        this.bar = true;
        fn();
      };
      file.parse = function (buildOptions, fn) {
        expect(bar).to.have.property('bar', true);
        this.foo = true;
        fn();
      };
      file.runWorkflow('default', {}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
  });

  describe('run', () => {
    it('should run a default set of workflows', (done) => {
      file.parse = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.run({}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a default set of workflows, including for dependencies', (done) => {
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
      file.run({}, (err) => {
        expect(bar).to.have.property('bar', true);
        done();
      });
    });
    it('should run a core set of workflows', (done) => {
      file.workflows.core = ['foo'];
      file.foo = function (buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.run({}, (err) => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a core set of workflows, including for dependencies', (done) => {
      const bar = new File('bar', path.resolve('src/bar.js'), 'js', {});

      bar.workflows.core = ['bar'];
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
      file.run({}, (err) => {
        expect(bar).to.have.property('bat', true);
        done();
      });
    });
  });

  describe.skip('workflow--', () => {
    describe('load()', () => {
      it('should load and store js file contents', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.load({}, (err) => {
          expect(instance.content).to.eql(instance.fileContent);
          expect(instance.content).to.eql("'use strict';\n\nmodule.exports = 'main';\n");
          done();
        });
      });
    });

    describe('transpile()', () => {
      it.skip('should namespace all root declarations', (done) => {
        const instance = fileFactory(path.resolve('src/namespace.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.transpile({}, (err) => {
          done();
        });
      });
    });

    describe('wrap()', () => {
      it('should wrap js file contents in a module definition', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.id = 'main';
        instance.content = "module.exports = 'main';";
        instance.wrap({}, (err) => {
          expect(instance.content).to.eql("_m_[\'main\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  module.exports = \'main\';\n\n  return module.exports;\n}).call({exports:{}});");
          done();
        });
      });
      it('should not wrap previously wrapped js file contents', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.id = 'main';
        instance.content = "_m_[\'main\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  module.exports = \'main\';\n\n  return module.exports;\n}).call({filename:\'main\',exports:{}});";
        instance.wrap({}, (err) => {
          expect(instance.content).to.eql("_m_[\'main\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  module.exports = \'main\';\n\n  return module.exports;\n}).call({filename:\'main\',exports:{}});");
          done();
        });
      });
    });

    describe('parse()', () => {
      it('should store an array of js dependencies', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions };
        const foo = fileFactory(path.resolve('src/foo.js'), options);
        const bar = fileFactory(path.resolve('src/bar.js'), options);
        const instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var foo = require('./foo');\nvar bar = require('./bar');";
        instance.parse({}, (err) => {
          expect(instance.dependencies).to.have.length(2);
          done();
        });
      });
      it('should store an array of css dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions };
        const foo = fileFactory(path.resolve('src/foo.css'), options);
        const instance = fileFactory(path.resolve('src/main.css'), options);

        instance.content = "@import 'foo'";
        instance.parse({}, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of html dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] } };
        const foo = fileFactory(path.resolve('src/foo.dust'), options);
        const instance = fileFactory(path.resolve('src/main.dust'), options);

        instance.content = '{>foo /}';
        instance.parse({}, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of html "inline" dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] }};
        const instance = fileFactory(path.resolve('src/main.dust'), options);

        instance.content = '<script inline src="src/foo.js"></script>';
        instance.parseInline({}, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions };
        const foo = fileFactory(path.resolve('src/foo.js'), options);
        const instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var foo = require('./foo');\nvar foo = require('./foo');";
        instance.parse({}, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store 2 dependency objects when there are case sensitive package references', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions };
        const instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var bat = require('bar');\nvar boo = require('Boo');";
        instance.parse({}, (err) => {
          expect(instance.dependencies).to.have.length(2);
          done();
        });
      });
    });

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

    describe('replaceEnvironment()', () => {
      it('should inline calls to process.env', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "process.env.NODE_ENV process.env['NODE_ENV'] process.env[\"NODE_ENV\"]";
        instance.replaceEnvironment({}, (err) => {
          expect(instance.content).to.eql("'test' 'test' 'test'");
          done();
        });
      });
      it('should inline calls to process.env.RUNTIME', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = 'process.env.RUNTIME';
        instance.replaceEnvironment({}, (err) => {
          expect(instance.content).to.eql("'browser'");
          done();
        });
      });
      it('should handle undefined values when inlining calls to process.env', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = 'process.env.FEATURE_FOO';
        instance.replaceEnvironment({}, (err) => {
          expect(instance.content).to.eql('process.env.FEATURE_FOO');
          done();
        });
      });
    });

    describe('inline()', () => {
      it('should inline require(*.json) content', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "var foo = require('./foo.json');";
        instance.dependencyReferences = [
          {
            instance: {
              filepath: path.resolve('./foo.json'),
              extension: 'json',
              type: 'json',
              content: fs.readFileSync(path.resolve('./src/foo.json'), 'utf8'),
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './foo.json',
            match: "require('./foo.json')"
          }
        ];
        instance.options = {
          runtimeOptions: {}
        };
        instance.inline({}, (err) => {
          expect(instance.content).to.eql('var foo = {\n\t"foo": "bar"\n};');
          done();
        });
      });
      it('should inline an empty object when unable to locate require(*.json) content', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "var foo = require('./bar.json');";
        instance.dependencyReferences = [
          {
            instance: {
              filepath: path.resolve('./bar.json'),
              extension: 'json',
              type: 'json',
              content: '',
              dependencies: [],
              dependencyReferences: []
            },
            filepath: './bar.json',
            match: "require('./bar.json')"
          }
        ];
        instance.options = {
          runtimeOptions: {}
        };
        instance.inline({}, (err) => {
          expect(instance.content).to.eql('var foo = {};');
          done();
        });
      });
      it('should replace css @import rules with file contents', (done) => {
        const instance = fileFactory(path.resolve('src/main.css'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "@import 'foo'\nbody {\n\tbackground-color: black;\n}";
        instance.dependencyReferences = [
          {
            filepath: 'foo',
            match: "@import 'foo'",
            instance: {
              dependencyReferences: [],
              content: 'div {\n\twidth: 50%;\n}\n'
            }
          }
        ];
        instance.options = {
          runtimeOptions: {}
        };
        instance.inline({}, (err) => {
          expect(instance.content).to.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
          done();
        });
      });
      it('should replace css @import rules with file contents, allowing duplicates', (done) => {
        const instance = fileFactory(path.resolve('src/main.css'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "@import 'foo'\n@import 'foo'";
        instance.dependencyReferences = [
          {
            filepath: 'foo',
            match: "@import 'foo'",
            instance: {
              dependencyReferences: [],
              content: 'div {\n\twidth: 50%;\n}\n'
            }
          }
        ];
        instance.options = {
          runtimeOptions: {}
        };
        instance.inline({}, (err) => {
          expect(instance.content).to.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
          done();
        });
      });
    });

    describe('run()', () => {
      it('should execute a workflow in sequence', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.run(['load', 'wrap'], false, () => {
          expect(instance.content).to.eql("_m_[\'main.js\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  \'use strict\';\n  \n  module.exports = \'main\';\n  \n\n  return module.exports;\n}).call({exports:{}});");
          done();
        });
      });
      it('should return several files when parsing dependencies', (done) => {
        const instance = fileFactory(path.resolve('src/bar.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.run(['load', 'parse'], false, (err, dependencies) => {
          expect(dependencies).to.have.length(1);
          expect(instance.content).to.eql("var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';");
          done();
        });
      });
    });
  });
});