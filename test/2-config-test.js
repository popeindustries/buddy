'use strict';

const config = require('../lib/config');
const expect = require('expect.js');
const merge = require('lodash/merge');
const path = require('path');
const plugins = require('../lib/utils/plugins');
const CWD = process.cwd();
let defaultConfig;

describe.only('config', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/config'));
  });
  beforeEach(() => {
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


  describe('locate', () => {
    describe('from a valid working directory', () => {
      it('should return a path to the default js file when no name is specified', () => {
        expect(config.locateConfig().toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
      });
      it('should return a path to the named file when a name is specified', () => {
        expect(config.locateConfig('buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('buddy_custom_name.js').toLowerCase());
      });
      it('should return a path to the default file in the specified directory when a directory name is specified', () => {
        expect(config.locateConfig('nested').toLowerCase()).to.equal(path.resolve('nested', 'buddy.js').toLowerCase());
      });
      it('should return a path to the default json file in the specified directory when a directory name is specified', () => {
        expect(config.locateConfig('json').toLowerCase()).to.equal(path.resolve('json', 'buddy.json').toLowerCase());
      });
      it('should return a path to the default package.json file in the specified directory when a directory name is specified', () => {
        expect(config.locateConfig('pkgjson').toLowerCase()).to.equal(path.resolve('pkgjson', 'package.json').toLowerCase());
      });
      it('should return a path to the named file in the specified directory when a directory and name are specified', () => {
        expect(config.locateConfig('nested/buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('nested', 'buddy_custom_name.js').toLowerCase());
      });
      it('should throw an error when an invalid name is specified', () => {
        try {
          config.locateConfig('buddy_no_name.js');
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
        expect(config.locateConfig().toLowerCase()).to.equal(path.resolve('../buddy.js').toLowerCase());
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
          config.locateConfig();
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
    });
  });

  describe('parseBuild', () => {
    it('should warn on deprecated format', () => {
      expect(config.parseBuild([{
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
      expect(config.parseBuild([{
        build: [{
          input: 'src/hey.js',
          output: 'js'
        }]
      }], defaultConfig)).to.be.ok();
    });
    it('should parse simple build "input"', () => {
      const build = config.parseBuild({
        input: 'src/hey.js',
        output: 'js'
      }, defaultConfig);

      expect(build[0].input).to.eql('src/hey.js');
      expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js')]);
    });
    it('should parse build "input"', () => {
      const build = config.parseBuild([{
        input: 'src/hey.js',
        output: 'js'
      }], defaultConfig);

      expect(build[0].input).to.eql('src/hey.js');
      expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js')]);
    });
    it('should parse build array "input"', () => {
      const build = config.parseBuild([{
        input: ['src/hey.js', 'src/ho.js'],
        output: 'js'
      }], defaultConfig);

      expect(build[0].input).to.eql(['src/hey.js', 'src/ho.js']);
      expect(build[0].inputpaths).to.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/hey.js'), path.resolve('js/ho.js')]);
    });
    it('should parse build when "input" and "output" are arrays of same length', () => {
      const build = config.parseBuild([{
        input: ['src/main.js', 'src/sub.js'],
        output: ['js/main.js', 'js/sub.js']
      }], defaultConfig);

      expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/sub.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/sub.js')]);
    });
    it('should parse batch build', () => {
      defaultConfig.sources = [process.cwd(), path.resolve('src')];
      const build = config.parseBuild([{
        input: 'src',
        output: 'js'
      }], defaultConfig);

      expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
      expect(build[0].batch).to.be(true);
    });
    it('should parse batch build target with nested resources', () => {
      defaultConfig.sources = [process.cwd(), path.resolve('src-nested')];
      const build = config.parseBuild([{
        input: 'src-nested',
        output: 'js'
      }], defaultConfig);

      expect(build[0].inputpaths).to.eql([path.resolve('src-nested/main.js'), path.resolve('src-nested/module.js'), path.resolve('src-nested/nested/sub.js'), path.resolve('src-nested/nested/sub2.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js'), path.resolve('js/nested/sub.js'), path.resolve('js/nested/sub2.js')]);
      expect(build[0].batch).to.be(true);
    });
    it('should parse build target with nested builds', () => {
      defaultConfig.sources = [process.cwd(), path.resolve('src-nested')];
      const build = config.parseBuild([{
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
      expect(build[0].index).to.equal(0);
      expect(build[0].build[0].index).to.equal(1);
      expect(build[0].options).to.equal(build[0].build[0].options);
    });
    it('should parse build target glob pattern "input"', () => {
      const build = config.parseBuild([{
        input: 'src/ma*.js',
        output: 'js'
      }], defaultConfig);

      expect(build[0].inputpaths).to.eql([path.resolve('src/main.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/main.js')]);
    });
    it('should parse build target glob pattern array "input"', () => {
      const build = config.parseBuild([{
        input: 'src/m*.js',
        output: 'js'
      }], defaultConfig);

      expect(build[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
      expect(build[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
    });
    it('should not parse build target "input" when not matched with "--grep" option', () => {
      const build = config.parseBuild([{
        input: 'src/hey.js',
        output: 'js'
      }], merge(defaultConfig, { runtimeOptions: { grep: '*.css' } }));

      expect(build).to.eql([]);
    });
    it('should parse build target "output"', () => {
      const build = config.parseBuild([{
        input: 'src/hey.js',
        output: 'js'
      }], defaultConfig);

      expect(build[0].output).to.eql('js');
      expect(build[0].outputpaths).to.eql([path.resolve('js/hey.js')]);
    });
    it('should parse array of directory "output"', () => {
      const build = config.parseBuild([{
        input: ['src', 'src-nested/nested'],
        output: 'js'
      }], defaultConfig);

      expect(build[0].outputpaths).to.contain(path.resolve('js/main.js'));
      expect(build[0].outputpaths).to.contain(path.resolve('js/sub.js'));
    });
    it('should parse build target "output_compressed"', () => {
      const build = config.parseBuild([{
        input: 'src/hey.js',
        output: 'js',
        output_compressed: 'c'
      }], merge(defaultConfig, { runtimeOptions: { compress: true } }));

      expect(build[0].output).to.eql('c');
      expect(build[0].outputpaths).to.eql([path.resolve('c/hey.js')]);
    });
    it('should throw an error when passed build target with directory "input" and a file "output"', () => {
      try {
        config.parseBuild([{
          input: 'src',
          output: 'js/main.js'
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
      try {
        config.parseBuild([{
          input: ['src/main.js', 'src'],
          output: ['js/main.js', 'js/foo.js']
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
    it('should throw an error when passed build target with single file "input" and multiple file "output"', () => {
      try {
        config.parseBuild([{
          input: 'src/main.js',
          output: ['js/main.js', 'js/foo.js']
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
    it('should return a build target with "appServer" set to TRUE when "server.file" is the same as "input"', () => {
      const build = config.parseBuild([{
        input: 'src/main.js'
      }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

      expect(build[0]).to.have.property('appServer', true);
    });
    it('should return a build target with "appServer" set to TRUE when "server.file" is in directory "input"', () => {
      const build = config.parseBuild([{
        input: 'src'
      }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

      expect(build[0]).to.have.property('appServer', true);
    });
    it('should return a build target with "appServer" set to TRUE when "server.file" matches a globbed "input"', () => {
      const build = config.parseBuild([{
        input: 'src/*.js'
      }], merge(defaultConfig, { server: { file: 'src/main.js' } }));

      expect(build[0]).to.have.property('appServer', true);
    });
    it('should return a build target with an executable "before" hook function', () => {
      const func = config.parseBuild([{
        input: 'src/main.js',
        output: 'js',
        before: 'console.log(context);'
      }], defaultConfig)[0].before;

      expect(typeof func == 'function').to.be(true);
    });
    it('should return a build target with an executable "before" hook function when passed a path', () => {
      const func = config.parseBuild([{
        input: 'src/main.js',
        output: 'js',
        before: './hooks/before.js'
      }], defaultConfig)[0].before;

      expect(typeof func == 'function').to.be(true);
    });
    it('should throw an error when passed invalid "before" hook path', () => {
      try {
        config.parseBuild([{
          input: 'src/main.js',
          output: 'js',
          before: './hook/before.js'
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
  });

  describe('loadPlugins', () => {
    before(() => {
      process.chdir(CWD);
    });
    after(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/config'));
    });

    it('should load Buddy plugins', () => {
      plugins.core(defaultConfig);
      expect(Object.keys(defaultConfig.compilers)).to.contain('coffee', 'nunjs');
      expect(defaultConfig.fileExtensions.js).to.contain('coffee');
      expect(defaultConfig.fileExtensions.html).to.contain('nunjs', 'nunjucks', 'hbs', 'handlebars');
    });
  });

  describe('load', () => {
    it('should return validated file data', () => {
      expect(config.load('buddy.js').build).to.be.ok();
    });
    it('should return validated file data for a package.json config file', () => {
      expect(config.load('pkgjson/package.json').build).to.be.ok();
    });
    it('should return validated file data for a passed in JSON object', () => {
      const c = config.load({
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
      expect(c.sources).to.be.an(Array);
      expect(c.build[0].options.babel.plugins[0]).to.have.length(1);
    });
    it('should return an error when passed a reference to a malformed file', () => {
      try {
        config.load('buddy_bad.js');
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
    it('should return an error when passed an invalid build configuration', () => {
      try {
        config.load('buddy_bad_build.js');
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
  });
});