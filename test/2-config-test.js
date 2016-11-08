'use strict';

const buildParser = require('../lib/config/buildParser');
const configFactory = require('../lib/config');
const expect = require('expect.js');
const fileCacheFactory = require('../lib/config/fileCache');
const path = require('path');
const pluginLoader = require('../lib/config/pluginLoader');
const rimraf = require('rimraf');

let config, dummyConfig;

describe('config', () => {
  beforeEach(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/config'));
  });
  afterEach(() => {
    if (config) config.destroy();
  });
  after(() => {
    rimraf.sync(path.resolve('package.json'));
    rimraf.sync(path.resolve('yarn.lock'));
    rimraf.sync(path.resolve('node_modules'));
  });

  describe('pluginLoader', () => {
    describe('loadBuildPlugins()', () => {
      it('should generate default Babel plugins', () => {
        const options = pluginLoader.loadBuildPlugins('js');

        expect(options.babel.plugins).to.have.length(2);
        expect(options.babel.plugins[0]).to.be.a(Function);
      });
      it('should generate and install Babel plugins based on target version', () => {
        const options = pluginLoader.loadBuildPlugins('js', undefined, 'node6');

        expect(options.babel.plugins).to.have.length(2);
        expect(options.babel.plugins[0]).to.be.a(Function);
      });
      it('should generate and install Babel plugins based on target version specified with object notation', () => {
        const options = pluginLoader.loadBuildPlugins('js', undefined, { node: 6 });

        expect(options.babel.plugins).to.have.length(2);
        expect(options.babel.plugins[0]).to.be.a(Function);
      });
      it('should generate and install Babel plugins based on browser target version', () => {
        const options = pluginLoader.loadBuildPlugins('js', undefined, { chrome: 46 });

        expect(options.babel.plugins).to.have.length(15);
        expect(options.babel.plugins[0]).to.be.a(Function);
      });
      it('should generate and install Babel and Postcss plugins based on browsers list', () => {
        const options = pluginLoader.loadBuildPlugins(undefined, undefined, { browsers: ['last 2 versions'] });

        // Don't know how many babel plugins
        expect(options.babel.plugins[0]).to.be.a(Function);
        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0]).to.be.an(Array);
      });
      it('should ignore unknown target versions', () => {
        const options = pluginLoader.loadBuildPlugins('js', undefined, 'foo');

        expect(options.babel.plugins).to.have.length(2);
      });
      it('should allow default plugins to be overridden', () => {
        const options = pluginLoader.loadBuildPlugins('js', { babel: { plugins: [['babel-plugin-external-helpers', { foo: true }]] } });

        expect(options.babel.plugins).to.have.length(2);
        expect(options.babel.plugins[0][1]).to.have.property('foo', true);
      });
      it('should allow adding custom plugins', () => {
        const options = pluginLoader.loadBuildPlugins(undefined, { foo: { plugins: ['yaw'] } });

        expect(options.foo.plugins).to.have.length(1);
      });
    });
  });

  describe('buildParser', () => {
    beforeEach(() => {
      dummyConfig = {
        build: [],
        caches: {},
        fileExtensions: {
          css: ['css'],
          html: ['html', 'htm'],
          image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
          js: ['js'],
          json: ['json']
        },
        fileFactory: configFactory({}).fileFactory,
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
        url: ''
      };
    });

    it('should handle deprecated "targets" format', () => {
      dummyConfig.build = {
        targets: [{
          input: 'src/hey.js',
          output: 'js'
        }]
      };
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths[0]).to.equal(path.resolve('src/hey.js'));
    });
    it('should allow passing build data "input" that doesn\'t exist', () => {
      dummyConfig.build = [{
        input: 'src/hey.js',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths[0]).to.equal(path.resolve('src/hey.js'));
    });
    it('should parse build array "input"', () => {
      dummyConfig.build = [{
        input: ['src/hey.js', 'src/ho.js'],
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].input).to.eql(['src/hey.js', 'src/ho.js']);
      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/hey.js'), path.resolve('js/ho.js')]);
    });
    it('should parse build when "input" and "output" are arrays of same length', () => {
      dummyConfig.build = [{
        input: ['src/main.js', 'src/sub.js'],
        output: ['js/main.js', 'js/sub.js']
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/sub.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/sub.js')]);
    });
    it('should parse batch build', () => {
      dummyConfig.build = [{
        input: 'src',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
      expect(dummyConfig.build[0].batch).to.be(true);
    });
    it('should parse batch build target with nested resources', () => {
      dummyConfig.build = [{
        input: 'src-nested',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src-nested/main.js'), path.resolve('src-nested/module.js'), path.resolve('src-nested/nested/sub.js'), path.resolve('src-nested/nested/sub2.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js'), path.resolve('js/nested/sub.js'), path.resolve('js/nested/sub2.js')]);
      expect(dummyConfig.build[0].batch).to.be(true);
    });
    it('should parse build target with nested builds', () => {
      dummyConfig.build = [{
        input: 'src-nested/main.js',
        output: 'js',
        build: [
          {
            input: 'src-nested/nested/sub.js',
            output: 'js'
          }
        ]
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].build).to.have.length(1);
      expect(dummyConfig.build[0].hasChildren).to.equal(true);
      expect(dummyConfig.build[0].childInputpaths).to.eql([path.resolve('src-nested/nested/sub.js')]);
      expect(dummyConfig.build[0].index).to.equal(1);
      expect(dummyConfig.build[0].build[0].index).to.equal(2);
      expect(dummyConfig.build[0].options).to.equal(dummyConfig.build[0].build[0].options);
    });
    it('should parse build target with nested builds and different "version"', () => {
      dummyConfig.build = [{
        input: 'src-nested/main.js',
        output: 'js',
        version: 'es2015',
        build: [
          {
            input: 'src-nested/nested/sub.js',
            output: 'js',
            version: 'es2016'
          }
        ]
      }];
      buildParser(dummyConfig);

      const parentFileFactory = dummyConfig.build[0].fileFactory;
      const childFileFactory = dummyConfig.build[0].build[0].fileFactory;

      const parentFile = parentFileFactory(dummyConfig.build[0].inputpaths[0]);
      const childFile = childFileFactory(dummyConfig.build[0].build[0].inputpaths[0]);

      expect(parentFileFactory).to.not.equal(childFileFactory);
      expect(parentFile.options.pluginOptions.babelFingerprint).to.not.equal(childFile.options.pluginOptions.babelFingerprint)
    });
    it('should parse build target glob pattern "input"', () => {
      dummyConfig.build = [{
        input: 'src/ma*.js',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src/main.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/main.js')]);
    });
    it('should parse build target glob pattern array "input"', () => {
      dummyConfig.build = [{
        input: 'src/m*.js',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
    });
    it('should not parse build target "input" when not matched with "--grep" option', () => {
      dummyConfig.runtimeOptions.grep = '*.css';
      dummyConfig.build = [{
        input: 'src/hey.js',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build).to.eql([]);
    });
    it('should parse build target "output"', () => {
      dummyConfig.build = [{
        input: 'src/hey.js',
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].output).to.eql('js');
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('js/hey.js')]);
    });
    it('should parse array of directory "output"', () => {
      dummyConfig.build = [{
        input: ['src', 'src-nested/nested'],
        output: 'js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].outputpaths).to.contain(path.resolve('js/main.js'));
      expect(dummyConfig.build[0].outputpaths).to.contain(path.resolve('js/sub.js'));
    });
    it('should parse build target "output_compressed"', () => {
      dummyConfig.runtimeOptions.compress = true;
      dummyConfig.build = [{
        input: 'src/hey.js',
        output: 'js',
        output_compressed: 'c'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0].output).to.eql('c');
      expect(dummyConfig.build[0].outputpaths).to.eql([path.resolve('c/hey.js')]);
    });
    it('should throw an error when passed build target with directory "input" and a file "output"', () => {
      let errored = false;

      dummyConfig.build = [{
        input: 'src',
        output: 'js/main.js'
      }];
      try {
        buildParser(dummyConfig);
      } catch (err) {
        errored = true;
        expect(err).to.be.an(Error);
      }
      expect(errored).to.equal(true);
    });
    it('should throw an error when passed build target with directory "input" and a file "output" with array', () => {
      let errored = false;

      dummyConfig.build = [{
        input: ['src/main.js', 'src'],
        output: ['js/main.js', 'js/foo.js']
      }];
      try {
        buildParser(dummyConfig);
      } catch (err) {
        errored = true;
        expect(err).to.be.an(Error);
      }
      expect(errored).to.equal(true);
    });
    it('should throw an error when passed build target with single file "input" and multiple file "output"', () => {
      let errored = false;

      dummyConfig.build = [{
        input: 'src/main.js',
        output: ['js/main.js', 'js/foo.js']
      }];
      try {
        buildParser(dummyConfig);
      } catch (err) {
        errored = true;
        expect(err).to.be.an(Error);
      }
      expect(errored).to.equal(true);
    });
    it('should return a build target with "isAppServer" set to TRUE when "server.file" is the same as "input"', () => {
      dummyConfig.server = { file: 'src/main.js' };
      dummyConfig.build = [{
        input: 'src/main.js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0]).to.have.property('isAppServer', true);
    });
    it('should return a build target with "isAppServer=true" when "server.file" is in directory "input"', () => {
      dummyConfig.server = { file: 'src/main.js' };
      dummyConfig.build = [{
        input: 'src'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0]).to.have.property('isAppServer', true);
    });
    it('should return a build target with "isAppServer=true" when "server.file" matches a globbed "input"', () => {
      dummyConfig.server = { file: 'src/main.js' };
      dummyConfig.build = [{
        input: 'src/*.js'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0]).to.have.property('isAppServer', true);
    });
    it('should return a build target with "browser=false" when "version" includes "node"', () => {
      dummyConfig.build = [{
        input: 'src/*.js',
        version: 'node'
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0]).to.have.property('browser', false);
    });
    it('should return a build target with "browser=false" when "version" includes "server"', () => {
      dummyConfig.build = [{
        input: 'src/*.js',
        version: ['server']
      }];
      buildParser(dummyConfig);

      expect(dummyConfig.build[0]).to.have.property('browser', false);
    });
  });

  describe('factory', () => {
    describe('locating config file', () => {
      describe('from a valid working directory', () => {
        it('should return a path to the default js file when no name is specified', () => {
          expect(configFactory().url.toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
        });
        it('should return a path to the named file when a name is specified', () => {
          expect(configFactory('buddy_custom_name.js').url.toLowerCase()).to.equal(path.resolve('buddy_custom_name.js').toLowerCase());
        });
        it('should return a path to the default file in the specified directory when a directory name is specified', () => {
          expect(configFactory('nested').url.toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
        });
        it('should return a path to the default json file in the specified directory when a directory name is specified', () => {
          expect(configFactory('json').url.toLowerCase()).to.equal(path.resolve('buddy.json').toLowerCase());
        });
        it('should return a path to the default package.json file in the specified directory when a directory name is specified', () => {
          expect(configFactory('pkgjson').url.toLowerCase()).to.equal(path.resolve('package.json').toLowerCase());
        });
        it('should return a path to the named file in the specified directory when a directory and name are specified', () => {
          expect(configFactory('nested/buddy_custom_name.js').url.toLowerCase()).to.equal(path.resolve('buddy_custom_name.js').toLowerCase());
        });
        it('should throw an error when an invalid name is specified', () => {
          let errored = false;

          try {
            configFactory('buddy_no_name.js');
          } catch (err) {
            errored = true;
            expect(err).to.be.an(Error);
          }
          expect(errored).to.equal(true);
        });
      });

      describe('from a valid child working directory', () => {
        it('should return a path to the default file in a parent of the cwd when no name is specified', () => {
          process.chdir(path.join(__dirname, 'fixtures/config/src'));
          expect(configFactory().url.toLowerCase()).to.equal(path.join(__dirname, 'fixtures/config/buddy.js').toLowerCase());
        });
        it('should parse all npm modules', () => {
          process.chdir(path.join(__dirname, 'fixtures/config/pkgjson'));
          expect(configFactory().npmModulepaths).to.eql([path.resolve('node_modules/@foo/foo'), path.resolve('node_modules/bar')]);
        });
      });

      describe('from an invalid working directory', () => {
        it('should return an error', () => {
          let errored = false;

          try {
            process.chdir('/');
            configFactory();
          } catch (err) {
            errored = true;
            expect(err).to.be.an(Error);
          }
          expect(errored).to.equal(true);
        });
      });
    });

    describe('loading', () => {
      it('should return validated file data', () => {
        expect(configFactory('buddy.js').build).to.be.ok();
      });
      it('should return validated file data for a package.json config file', () => {
        expect(configFactory('pkgjson/package.json').build).to.be.ok();
      });
      it('should return validated file data for a passed in JSON object', () => {
        const config = configFactory({
          build: [{
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
          }]
        });

        expect(config.build).to.be.ok();
        expect(config.build).to.be.an(Array);
        expect(config.build[0].sources).to.equal(config.build[0].build[0].sources);
      });
      it('should return an error when passed a reference to a malformed file', () => {
        let errored = false;

        try {
          configFactory('buddy_bad.js');
        } catch (err) {
          errored = true;
          expect(err).to.be.an(Error);
        }
        expect(errored).to.equal(true);
      });
      it('should return an error when passed an invalid build configuration', () => {
        let errored = false;

        try {
          configFactory('buddy_bad_build.js');
        } catch (err) {
          errored = true;
          expect(err).to.be.an(Error);
        }
        expect(errored).to.equal(true);
      });
    });

    describe('loading plugins', () => {
      it('should load default plugin modules', () => {
        config = configFactory({ build: {} });
        expect(config.fileExtensions.html).to.eql(['html', 'htm']);
        expect(config.fileDefinitionByExtension.js.name).to.equal('JSFile');
      });
    });

    describe('registerFileExtensionsForType()', () => {
      beforeEach(() => {
        config = configFactory({ build: {} });
      });

      it('should register extension for new file type', () => {
        config.registerFileExtensionsForType(['foo'], 'js');
        expect(config.fileExtensions.js).to.eql(['js', 'json', 'jsx', 'foo']);
      });
      it('should register multiple extensions for existing file type', () => {
        config.registerFileExtensionsForType(['foo', 'bar'], 'js');
        expect(config.fileExtensions.js).to.eql(['js', 'json', 'jsx', 'foo', 'bar']);
      });
    });

    describe('registerTargetVersionForType()', () => {
      it.skip('should register a target version for js type', () => {
        config = configFactory({ build: { input: 'src/main.js', output: '.', version: ['foo'] } });
        config.registerTargetVersionForType('foo', ['foo'], 'js');
        console.log(config)
        // expect(config.fileExtensions.js).to.eql(['js', 'json', 'jsx', 'foo']);
      });
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

    describe('fileFactory()', () => {
      let options;

      beforeEach(() => {
        config = configFactory({ build: {} });
        options = {
          fileCache: fileCacheFactory(),
          fileExtensions: config.fileExtensions,
          fileFactory () {},
          runtimeOptions: config.runtimeOptions
        };
      });

      it('should return a file instance for default type', () => {
        const file = config.fileFactory(path.resolve('src/main.js'), options);

        expect(file).to.be.ok();
        expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
        expect(file).to.have.property('type', 'js');
        expect(file).to.have.property('id', 'src/main');
      });
      it('should return a file instance for custom type', () => {
        config.registerFileDefinitionAndExtensionsForType((File) => {
          return class BARFile extends File {
            constructor (id, filepath, options) {
              super(id, filepath, 'bar', options);
            }
          };
        }, ['bar'], 'bar');

        const file = config.fileFactory(path.resolve('src/foo.bar'), options);

        expect(file).to.be.ok();
        expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
        expect(file).to.have.property('type', 'bar');
        expect(file).to.have.property('id', 'src/foo');
      });
      it('should return a file instance for extended default type', () => {
        config.registerFileDefinitionAndExtensionsForType((File) => {
          return class BARFile extends File {};
        }, ['bar'], 'js');

        const file = config.fileFactory(path.resolve('src/foo.bar'), options);

        expect(file).to.be.ok();
        expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
        expect(file).to.have.property('type', 'js');
        expect(file).to.have.property('id', 'src/foo');
      });
    });
  });
});