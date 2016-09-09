'use strict';

const configFactory = require('../lib/config');
const configLoader = require('../lib/configLoader');
const expect = require('expect.js');
const merge = require('lodash/merge');
const path = require('path');
const pluginLoader = require('../lib/utils/pluginLoader');

let config, defaultConfig;

describe('config', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/config'));
  });
  beforeEach(() => {
    config = configFactory();
    defaultConfig = {
      build: {},
      compilers: {},
      compressors: {},
      fileExtensions: {
        css: ['css'],
        html: ['html'],
        image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
        js: ['js', 'json']
      },
      fileFilter: /./,
      runtimeOptions: {
        compress: false,
        deploy: false,
        grep: false,
        invert: false,
        reload: false,
        script: false,
        serve: false,
        watch: false,
        verbose: false
      },
      sources: [process.cwd()],
      url: '',
      workflows: {}
    };
  });

  describe('config factory', () => {
    describe('registerFileExtensionsForType()', () => {
      it('should register extension for new file type', () => {
        config.registerFileExtensionsForType(['foo'], 'js');
        expect(config.fileExtensions).to.eql(['foo']);
        expect(config.fileExtensionsByType).to.eql({ js: ['foo'] });
      });
      it('should register multiple extensions for existing file type', () => {
        config.registerFileExtensionsForType(['js'], 'js');
        config.registerFileExtensionsForType(['foo', 'bar'], 'js');
        expect(config.fileExtensions).to.eql(['js', 'foo', 'bar']);
        expect(config.fileExtensionsByType).to.eql({ js: ['js', 'foo', 'bar'] });
      });
    });
    describe('registerTargetVersionForType()', () => {
      it('should register a target version for js type');
    });
    describe('registerFileDefinitionAndExtensionsForType()', () => {
      it('should register a file definition');
      it('should register a file definition for a new type');
      it('should register a file definition for an existing type');
    });
    describe('extendFileDefinitionForExtensionsOrType()', () => {
      it('should extend a file definition for an extension');
      it('should extend a file definition for a type');
    });
  });

  describe('pluginLoader', () => {
    describe('loadPluginModules()', () => {
      it('should load default plugin modules', () => {
        pluginLoader.loadPluginModules(config);

        expect(config.fileExtensions).to.have.length(9);
        expect(config.fileExtensionsByType.html).to.eql(['html', 'htm']);
        expect(config.fileDefinitionByExtension.js.name).to.equal('JSFile');
      });
    });
  });

  describe('configLoader', () => {
    describe('locateConfig()', () => {
      describe('from a valid working directory', () => {
        it('should return a path to the default js file when no name is specified', () => {
          expect(configLoader.locateConfig().toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
        });
        it('should return a path to the named file when a name is specified', () => {
          expect(configLoader.locateConfig('buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('buddy_custom_name.js').toLowerCase());
        });
        it('should return a path to the default file in the specified directory when a directory name is specified', () => {
          expect(configLoader.locateConfig('nested').toLowerCase()).to.equal(path.resolve('nested', 'buddy.js').toLowerCase());
        });
        it('should return a path to the default json file in the specified directory when a directory name is specified', () => {
          expect(configLoader.locateConfig('json').toLowerCase()).to.equal(path.resolve('json', 'buddy.json').toLowerCase());
        });
        it('should return a path to the default package.json file in the specified directory when a directory name is specified', () => {
          expect(configLoader.locateConfig('pkgjson').toLowerCase()).to.equal(path.resolve('pkgjson', 'package.json').toLowerCase());
        });
        it('should return a path to the named file in the specified directory when a directory and name are specified', () => {
          expect(configLoader.locateConfig('nested/buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('nested', 'buddy_custom_name.js').toLowerCase());
        });
        it('should throw an error when an invalid name is specified', () => {
          try {
            configLoader.locateConfig('buddy_no_name.js');
          } catch (err) {
            expect(err).to.be.an(Error);
          }
        });
      });

      describe('from a valid child working directory', () => {
        before(() => {
          process.chdir(path.resolve('src'));
        });
        after(() => {
          process.chdir(path.resolve(__dirname, 'fixtures/config'));
        });
        it('should return a path to the default file in a parent of the cwd when no name is specified', () => {
          expect(configLoader.locateConfig().toLowerCase()).to.equal(path.resolve('../buddy.js').toLowerCase());
        });
      });

      describe('from an invalid working directory', () => {
        before(() => {
          process.chdir('/');
        });
        after(() => {
          process.chdir(path.resolve(__dirname, 'fixtures/config'));
        });
        it('should return an error', () => {
          try {
            configLoader.locateConfig();
          } catch (err) {
            expect(err).to.be.an(Error);
          }
        });
      });
    });
    describe('parseBuild', () => {
      it('should warn on deprecated format', () => {
        expect(configLoader.parseBuild([{
          js: {
            sources: [],
            targets: [{
              input: 'src/hey.js',
              output: 'js'
            }]
          }
        }], defaultConfig)).to.eql([]);
      });
      it('should allow passing build data "input" that doesn\'t exist', () => {
        expect(configLoader.parseBuild([{
          build: [{
            input: 'src/hey.js',
            output: 'js'
          }]
        }], defaultConfig)).to.be.ok();
      });
      it('should parse simple build "input"', () => {
        const build = configLoader.parseBuild({
          input: 'src/hey.js',
          output: 'js'
        }, defaultConfig);

        expect(build[0].input).to.eql('src/hey.js');
        expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js')]);
      });
      it('should parse build "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/hey.js',
          output: 'js'
        }], defaultConfig);

        expect(build[0].input).to.eql('src/hey.js');
        expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js')]);
      });
      it('should parse build array "input"', () => {
        const build = configLoader.parseBuild([{
          input: ['src/hey.js', 'src/ho.js'],
          output: 'js'
        }], defaultConfig);

        expect(build[0].input).to.eql(['src/hey.js', 'src/ho.js']);
        expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/hey.js'), path.resolve('js/ho.js')]);
      });
      it('should parse build when "input" and "output" are arrays of same length', () => {
        const build = configLoader.parseBuild([{
          input: ['src/main.js', 'src/sub.js'],
          output: ['js/main.js', 'js/sub.js']
        }], defaultConfig);

        expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/sub.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/sub.js')]);
      });
      it('should parse batch build', () => {
        defaultConfig.sources = [process.cwd(), path.resolve('src')];
        const build = configLoader.parseBuild([{
          input: 'src',
          output: 'js'
        }], defaultConfig);

        expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
        expect(build[0].batch).to.be(true);
      });
      it('should parse batch build target with nested resources', () => {
        defaultConfig.sources = [process.cwd(), path.resolve('src-nested')];
        const build = configLoader.parseBuild([{
          input: 'src-nested',
          output: 'js'
        }], defaultConfig);

        expect(build[0].inputpaths).to.eql([path.resolve('src-nested/main.js'), path.resolve('src-nested/module.js'), path.resolve('src-nested/nested/sub.js'), path.resolve('src-nested/nested/sub2.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js'), path.resolve('js/nested/sub.js'), path.resolve('js/nested/sub2.js')]);
        expect(build[0].batch).to.be(true);
      });
      it('should parse build target with nested builds', () => {
        defaultConfig.sources = [process.cwd(), path.resolve('src-nested')];
        const build = configLoader.parseBuild([{
          input: 'src-nested/main.js',
          output: 'js',
          build: [
            {
              input: 'src-nested/nested/sub.js',
              output: 'js'
            }
          ]
        }], defaultConfig);

        expect(build[0].build).to.have.length(1);
        expect(build[0].hasChildren).to.equal(true);
        expect(build[0].childInputpaths).to.eql([path.resolve('src-nested/nested/sub.js')]);
        expect(build[0].index).to.equal(1);
        expect(build[0].build[0].index).to.equal(2);
        expect(build[0].options).to.equal(build[0].build[0].options);
      });
      it('should parse build target glob pattern "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/ma*.js',
          output: 'js'
        }], defaultConfig);

        expect(build[0].inputpaths).to.eql([path.resolve('src/main.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/main.js')]);
      });
      it('should parse build target glob pattern array "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/m*.js',
          output: 'js'
        }], defaultConfig);

        expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
        expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
      });
      it('should not parse build target "input" when not matched with "--grep" option', () => {
        const build = configLoader.parseBuild([{
          input: 'src/hey.js',
          output: 'js'
        }], merge(defaultConfig, { runtimeOptions: { grep: '*.css' } }));

        expect(build).to.eql([]);
      });
      it('should parse build target "output"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/hey.js',
          output: 'js'
        }], defaultConfig);

        expect(build[0].output).to.eql('js');
        expect(build[0].outputpaths).to.eql([path.resolve('js/hey.js')]);
      });
      it('should parse array of directory "output"', () => {
        const build = configLoader.parseBuild([{
          input: ['src', 'src-nested/nested'],
          output: 'js'
        }], defaultConfig);

        expect(build[0].outputpaths).to.contain(path.resolve('js/main.js'));
        expect(build[0].outputpaths).to.contain(path.resolve('js/sub.js'));
      });
      it('should parse build target "output_compressed"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/hey.js',
          output: 'js',
          output_compressed: 'c'
        }], merge(defaultConfig, { runtimeOptions: { compress: true } }));

        expect(build[0].output).to.eql('c');
        expect(build[0].outputpaths).to.eql([path.resolve('c/hey.js')]);
      });
      it('should parse build target workflows', () => {
        const build = configLoader.parseBuild([{
          input: 'src/hey.js',
          output: 'js'
        }], merge(defaultConfig, { runtimeOptions: { compress: true } }));

        expect(build[0].workflows.inlineable.js).to.contain('compress');
        expect(build[0].workflows.writeable.js).to.contain('compress');
      });
      it('should throw an error when passed build target with directory "input" and a file "output"', () => {
        try {
          configLoader.parseBuild([{
            input: 'src',
            output: 'js/main.js'
          }], defaultConfig);
        } catch (err) {
          expect(err).to.be.an(Error);
        }
        try {
          configLoader.parseBuild([{
            input: ['src/main.js', 'src'],
            output: ['js/main.js', 'js/foo.js']
          }], defaultConfig);
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
      it('should throw an error when passed build target with single file "input" and multiple file "output"', () => {
        try {
          configLoader.parseBuild([{
            input: 'src/main.js',
            output: ['js/main.js', 'js/foo.js']
          }], defaultConfig);
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
      it('should return a build target with "isAppServer" set to TRUE when "server.file" is the same as "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/main.js'
        }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

        expect(build[0]).to.have.property('isAppServer', true);
      });
      it('should return a build target with "isAppServer" set to TRUE when "server.file" is in directory "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src'
        }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

        expect(build[0]).to.have.property('isAppServer', true);
      });
      it('should return a build target with "isAppServer" set to TRUE when "server.file" matches a globbed "input"', () => {
        const build = configLoader.parseBuild([{
          input: 'src/*.js'
        }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

        expect(build[0]).to.have.property('isAppServer', true);
      });
      it('should return a build target with an executable "before" hook function', () => {
        const func = configLoader.parseBuild([{
          input: 'src/main.js',
          output: 'js',
          before: 'console.log(context);'
        }], defaultConfig)[0].before;

        expect(typeof func == 'function').to.be(true);
      });
      it('should return a build target with an executable "before" hook function when passed a path', () => {
        const func = configLoader.parseBuild([{
          input: 'src/main.js',
          output: 'js',
          before: './hooks/before.js'
        }], defaultConfig)[0].before;

        expect(typeof func == 'function').to.be(true);
      });
      it('should throw an error when passed invalid "before" hook path', () => {
        try {
          configLoader.parseBuild([{
            input: 'src/main.js',
            output: 'js',
            before: './hook/before.js'
          }], defaultConfig);
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
    });
    describe('load', () => {
      it('should return validated file data', () => {
        expect(configLoader.load('buddy.js').build).to.be.ok();
      });
      it('should return validated file data for a package.json config file', () => {
        expect(configLoader.load('pkgjson/package.json').build).to.be.ok();
      });
      it('should return validated file data for a passed in JSON object', () => {
        const c = configLoader.load({
          input: 'src-nested/main.js',
          output: 'js',
          build: [
            {
              input: 'src-nested/nested/sub.js',
              output: 'js'
            },
            {
              input: 'src-nested/nested/sub2.js',
              output: 'js'
            }
          ]
        });

        expect(c.build).to.be.ok();
        expect(c.build).to.be.an(Array);
        expect(c.build[0].options.babel.plugins[0]).to.have.length(1);
        expect(c.build[0].compilers).to.equal(c.build[0].build[0].compilers);
        expect(c.build[0].sources).to.equal(c.build[0].build[0].sources);
      });
      it('should return an error when passed a reference to a malformed file', () => {
        try {
          configLoader.load('buddy_bad.js');
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
      it('should return an error when passed an invalid build configuration', () => {
        try {
          configLoader.load('buddy_bad_build.js');
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
    });
  });
});