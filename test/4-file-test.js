'use strict';

const expect = require('expect.js')
  , fileFactory = require('../lib/file')
  , fs = require('fs')
  , identifyResource = require('../lib/identify-resource')
  , path = require('path')

  , fileExtensions = {
      js: ['js'],
      json: ['json'],
      css: ['css'],
      html: ['html', 'dust']
    };

describe('file', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/file'));
  });
  beforeEach(() => {
    fileFactory.cache.flush();
    identifyResource.clearCache();
  });

  describe('factory', () => {
    it('should decorate a new File instance with passed data', () => {
      const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

      expect(instance).to.have.property('type', 'js');
    });
    it('should resolve a module id for a File instance', () => {
      const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

      expect(instance).to.have.property('id', 'src/main.js');
    });
    it('should resolve a module id for an "index" File instance', () => {
      const instance = fileFactory(path.resolve('src/index.js'), { sources: [path.resolve('src')], fileExtensions });

      expect(instance).to.have.property('id', 'src/index.js');
    });
    it('should resolve a module id for a node_module "index" File instance ', () => {
      const instance = fileFactory(path.resolve('node_modules/foo/index.js'), { sources: [], fileExtensions });

      expect(instance).to.have.property('id', 'foo/index.js');
    });
    it('should resolve a module id for a node_modules package.json "main" File instance', () => {
      const instance = fileFactory(path.resolve('node_modules/bar/bar.js'), { sources: [], fileExtensions });

      expect(instance).to.have.property('id', 'bar/bar.js#1.0.0');
    });
  });

  describe('workflow', () => {
    describe('load()', () => {
      it('should load and store js file contents', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.load(false, (err) => {
          expect(instance.content).to.eql(instance.fileContent);
          expect(instance.content).to.eql("'use strict';\n\nmodule.exports = 'main';\n");
          done();
        });
      });
    });

    describe('wrap()', () => {
      it('should wrap js file contents in a module definition', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.id = 'main';
        instance.content = "module.exports = 'main';";
        instance.wrap(false, (err) => {
          expect(instance.content).to.eql("require.register('main', function(require, module, exports) {\n    module.exports = 'main';\n});");
          done();
        });
      });
      it('should not wrap previously wrapped js file contents', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.id = 'main';
        instance.content = "require.register('main', function(require, module, exports) {\n    module.exports = 'main';\n});";
        instance.wrap(false, (err) => {
          expect(instance.content).to.eql("require.register('main', function(require, module, exports) {\n    module.exports = 'main';\n});");
          done();
        });
      });
      it('should wrap js file contents that contain "require.register"', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.id = 'main';
        instance.content = "var locale=require(\"src/lib/data/locale/index.js\");module.exports=function(e){var t=e.code;e.momentSource&&(window.require.register(t,e.momentSource),require(t),delete e.momentSource),locale.create(t,e)}";
        instance.wrap(false, (err) => {
          expect(instance.content).to.eql("require.register(\'main\', function(require, module, exports) {\n    var locale=require(\"src/lib/data/locale/index.js\");module.exports=function(e){var t=e.code;e.momentSource&&(window.require.register(t,e.momentSource),require(t),delete e.momentSource),locale.create(t,e)}\n});");
          done();
        });
      });
    });

    describe('parse()', () => {
      it('should store an array of js dependencies', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions }
          , foo = fileFactory(path.resolve('src/foo.js'), options)
          , bar = fileFactory(path.resolve('src/bar.js'), options)
          , instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var foo = require('./foo');\nvar bar = require('./bar');";
        instance.parse(false, (err) => {
          expect(instance.dependencies).to.have.length(2);
          done();
        });
      });
      it('should store an array of css dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions }
          , foo = fileFactory(path.resolve('src/foo.css'), options)
          , instance = fileFactory(path.resolve('src/main.css'), options);

        instance.content = "@import 'foo'";
        instance.parse(false, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of html dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] }}
          , foo = fileFactory(path.resolve('src/foo.dust'), options)
          , instance = fileFactory(path.resolve('src/main.dust'), options);

        instance.content = '{>foo /}';
        instance.parse(false, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store an array of html "inline" dependency objects', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] }}
          , instance = fileFactory(path.resolve('src/main.dust'), options);

        instance.content = '<script inline src="src/foo.js"></script>';
        instance.parseInline(false, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should only store 1 dependency object when there are duplicates', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions }
          , foo = fileFactory(path.resolve('src/foo.js'), options)
          , instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var foo = require('./foo');\nvar foo = require('./foo');";
        instance.parse(false, (err) => {
          expect(instance.dependencies).to.have.length(1);
          done();
        });
      });
      it('should store 2 dependency objects when there are case sensitive package references', (done) => {
        const options = { sources: [path.resolve('src')], fileExtensions }
          , instance = fileFactory(path.resolve('src/main.js'), options);

        instance.content = "var bat = require('bar');\nvar boo = require('Boo');";
        instance.parse(false, (err) => {
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
            filepath: './foo',
            match: "require('./foo')",
            instance: { id: 'foo' }
          }
        ];
        instance.replaceReferences(false, (err) => {
          expect(instance.content).to.eql("var foo = require('foo');");
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
        instance.replaceReferences(false, (err) => {
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
        instance.replaceReferences(false, (err) => {
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
        instance.replaceReferences(false, (err) => {
          expect(instance.content).to.eql("var bar = require('bar@0');\nvar baz = require('view/baz');");
          done();
        });
      });
    });

    describe('replaceEnvironment()', () => {
      it('should inline calls to process.env', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "process.env.NODE_ENV process.env['NODE_ENV'] process.env[\"NODE_ENV\"]";
        instance.replaceEnvironment(false, (err) => {
          expect(instance.content).to.eql("'test' 'test' 'test'");
          done();
        });
      });
      it('should inline calls to process.env.RUNTIME', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = "process.env.RUNTIME";
        instance.replaceEnvironment(false, (err) => {
          expect(instance.content).to.eql("'browser'");
          done();
        });
      });
      it('should handle undefined values when inlining calls to process.env', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.content = 'process.env.FEATURE_FOO';
        instance.replaceEnvironment(false, (err) => {
          expect(instance.content).to.eql('undefined');
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
        instance.inline(false, (err) => {
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
        instance.inline(false, (err) => {
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
        instance.inline(false, (err) => {
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
        instance.inline(false, (err) => {
          expect(instance.content).to.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
          done();
        });
      });
    });

    describe('run()', () => {
      it('should execute a workflow in sequence', (done) => {
        const instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions });

        instance.run(['load', 'wrap'], false, () => {
          expect(instance.content).to.eql("require.register('src/main.js', function(require, module, exports) {\n    'use strict';\n    \n    module.exports = 'main';\n    \n});");
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