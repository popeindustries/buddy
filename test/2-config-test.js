'use strict';

const config = require('../lib/config')
  , expect = require('expect.js')
  , merge = require('lodash/merge')
  , path = require('path')

  , CWD = process.cwd();

let defaultConfig = null;

describe('config', () => {
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
      runtimeOptions: {
        compress: false,
        deploy: false,
        grep: false,
        invert: false,
        lazy: false,
        lint: false,
        reload: false,
        script: false,
        serve: false,
        watch: false,
        verbose: false
      },
      sources: ['.'],
      url: '',
      workflows: {}
    };
  });


  describe('locate', () => {
    describe('from a valid working directory', () => {
      it('should return a path to the default js file when no name is specified', () => {
        expect(config.locate().toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
      });
      it('should return a path to the named file when a name is specified', () => {
        expect(config.locate('buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('buddy_custom_name.js').toLowerCase());
      });
      it('should return a path to the default file in the specified directory when a directory name is specified', () => {
        expect(config.locate('nested').toLowerCase()).to.equal(path.resolve('nested', 'buddy.js').toLowerCase());
      });
      it('should return a path to the default json file in the specified directory when a directory name is specified', () => {
        expect(config.locate('json').toLowerCase()).to.equal(path.resolve('json', 'buddy.json').toLowerCase());
      });
      it('should return a path to the default package.json file in the specified directory when a directory name is specified', () => {
        expect(config.locate('pkgjson').toLowerCase()).to.equal(path.resolve('pkgjson', 'package.json').toLowerCase());
      });
      it('should return a path to the named file in the specified directory when a directory and name are specified', () => {
        expect(config.locate('nested/buddy_custom_name.js').toLowerCase()).to.equal(path.resolve('nested', 'buddy_custom_name.js').toLowerCase());
      });
      it('should throw an error when an invalid name is specified', () => {
        try {
          config.locate('buddy_no_name.js');
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
        expect(config.locate().toLowerCase()).to.equal(path.resolve('../buddy.js').toLowerCase());
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
          config.locate();
        } catch (err) {
          expect(err).to.be.an(Error);
        }
      });
    });
  });

  describe('parse', () => {
    it('should warn on deprecated format', () => {
      expect(config.parse([{
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
      expect(config.parse([{
        targets: [{
          input: 'src/hey.js',
          output: 'js'
        }]
      }], defaultConfig)).to.be.ok();
    });
    it('should parse target "input"', () => {
      const target = config.parse([{
        input: 'src/hey.js',
        output: 'js'
      }], defaultConfig);

      expect(target[0].input).to.eql('src/hey.js');
      expect(target[0].inputpath).to.eql(path.resolve('src/hey.js'));
    });
    it('should parse target array "input"', () => {
      const target = config.parse([{
        input: ['src/hey.js', 'src/ho.js'],
        output: 'js'
      }], defaultConfig);

      expect(target[0].input).to.eql(['src/hey.js', 'src/ho.js']);
      expect(target[0].inputpath).to.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
    });
    it('should parse target glob pattern "input"', () => {
      const target = config.parse([{
        input: 'src/ma*.js',
        output: 'js'
      }], defaultConfig);

      expect(target[0].input).to.eql('src/main.js');
      expect(target[0].inputpath).to.eql(path.resolve('src/main.js'));
    });
    it('should parse target glob pattern array "input"', () => {
      const target = config.parse([{
        input: 'src/m*.js',
        output: 'js'
      }], defaultConfig);

      expect(target[0].input).to.eql(['src/main.js', 'src/module.js']);
      expect(target[0].inputpath).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
    });
    it('should not parse target "input" when not matched with "--grep" option', () => {
      const target = config.parse([{
        input: 'src/hey.js',
        output: 'js'
      }], merge(defaultConfig, { runtimeOptions: { grep: '*.css' }}));

      expect(target).to.eql([]);
    });
    it('should parse target "output"', () => {
      const target = config.parse([{
        input: 'src/hey.js',
        output: 'js'
      }], defaultConfig);

      expect(target[0].output).to.eql('js');
      expect(target[0].outputpath).to.eql(path.resolve('js'));
    });
    it('should parse target "output_compressed"', () => {
      const target = config.parse([{
        input: 'src/hey.js',
        output: 'js',
        output_compressed: 'c'
      }], merge(defaultConfig, { runtimeOptions: { compress: true }}));

      expect(target[0].output).to.eql('js');
      expect(target[0].outputpath).to.eql(path.resolve('c'));
    });
    it('should return multiple targets when "input" and "output" are arrays of same length', () => {
      const target = config.parse([{
        input: ['src/main.js', 'src/sub.js'],
        output: ['js/main.js', 'js/sub.js']
      }], defaultConfig);

      expect(target).to.have.length(2);
    });
    it('should throw an error when passed build data with directory "input" and a file "output"', () => {
      try {
        config.parse([{
          input: 'src',
          output: 'js/main.js'
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
      try {
        config.parse([{
          input: ['src/main.js', 'src'],
          output: ['js/main.js', 'js/foo.js']
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
    it('should throw an error when passed build data with single file "input" and multiple file "output"', () => {
      try {
        config.parse([{
          input: 'src/main.js',
          output: ['js/main.js', 'js/foo.js']
        }], defaultConfig);
      } catch (err) {
        expect(err).to.be.an(Error);
      }
    });
    it('should return a target with "batch" set to TRUE when "input" is a directory', () => {
      expect(config.parse([{
        input: 'src',
        output: 'js'
      }], defaultConfig)[0]).to.have.property('batch', true);
    });
    it('should return a target with "appServer" set to TRUE when "server.file" is the same as "input"', () => {
      const target = config.parse([{
        input: 'src/main.js'
      }], merge(defaultConfig, { server: { file: 'src/main.js' }}));

      expect(target[0]).to.have.property('appServer', true);
    });
    it('should return a target with "appServer" set to TRUE when "server.file" is in directory "input"', () => {
      const target = config.parse([{
        input: 'src'
      }], merge(defaultConfig, { server: { file: 'src/main.js' }}));

      expect(target[0]).to.have.property('appServer', true);
    });
    it('should return a target with "appServer" set to TRUE when "server.file" matches a globbed "input"', () => {
      const target = config.parse([{
        input: 'src/*.js'
      }], merge(defaultConfig, { server: { file: 'src/main.js' }}));

      expect(target[0]).to.have.property('appServer', true);
    });
    it('should return a target with passed "sources"', () => {
      const target = config.parse([{
        sources: ['foo'],
        targets: [{
          input: 'src/main.js',
          output: 'js'
        }]
      }], defaultConfig);

      expect(target[0].sources).to.eql([path.resolve('foo'), process.cwd()]);
    });
    it('should return a target with an executable "before" hook function', () => {
      const func = config.parse([{
        input: 'src/main.js',
        output: 'js',
        before: 'console.log(context);'
      }], defaultConfig)[0].before;

      expect(typeof func == 'function').to.be(true);
    });
    it('should return a target with an executable "before" hook function when passed a path', () => {
      const func = config.parse([{
        input: 'src/main.js',
        output: 'js',
        before: './hooks/before.js'
      }], defaultConfig)[0].before;

      expect(typeof func == 'function').to.be(true);
    });
    it('should throw an error when passed invalid "before" hook path', () => {
      try {
        config.parse([{
          input: 'src/main.js',
          output: 'js',
          before: './hook/before.js'
        }], defaultConfig)[0].before;
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

    it('should load "transfigure-" plugins', () => {
      config.loadPlugins(defaultConfig);
      expect(Object.keys(defaultConfig.compilers)).to.contain('coffee', 'nunjs');
      expect(defaultConfig.fileExtensions.js).to.contain('coffee');
      expect(defaultConfig.fileExtensions.html).to.contain('nunjs', 'nunjucks');
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
      expect(config.load({
        build: {
          sources: ['src'],
          targets: [{
            input: 'src/main.js',
            output: 'js/main.js'
          }]
        }
      }).build).to.be.ok();
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