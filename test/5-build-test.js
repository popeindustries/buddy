'use strict';

const buildFactory = require('../lib/build');
const configFactory = require('../lib/config');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

let config, build;

describe('build', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/build'));
  });
  beforeEach(() => {
    if (!fs.existsSync(path.resolve('temp'))) fs.mkdirSync(path.resolve('temp'));
  });
  afterEach(() => {
    if (config) config.destroy();
    rimraf.sync(path.resolve('temp'));
  });

  describe('factory', () => {
    it('should decorate a new instance with passed data', () => {
      config = configFactory({
        input: 'src/js/foo.js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);

      expect(build).to.have.property('output', 'js');
      expect(build).to.have.property('fileFactory');
    });
    it('should generate an "inputString" for simple "input"', () => {
      config = configFactory({
        input: 'src/js/foo.js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);

      expect(build).to.have.property('inputString', 'js/foo.js');
    });
    it('should generate an "inputString" for complex "input"', () => {
      config = configFactory({
        input: ['src/js/foo.js', 'src/js/bar.js'],
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);

      expect(build).to.have.property('inputString', 'js/foo.js, js/bar.js');
    });
    it('should generate a trimmed "inputString" for long, complex "input"', () => {
      config = configFactory({
        input: 'src/js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);

      expect(build).to.have.property('inputString', 'js/bar.js, js/bat.js, js/baz.js ...and 1 other');
    });
  });

  describe('initFiles()', () => {
    it('should return File instances', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);
      build.initFiles(build.inputpaths, (err, files) => {
        expect(files).to.have.length(1);
        expect(files[0]).to.have.property('hash', '80f0a76176369c88dba5313c04a40ad9');
        done();
      });
    });
  });

  describe('processFiles()', () => {
    it('should return all referenced files', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);
      const files = [build.fileFactory(build.inputpaths[0], build.fileFactoryOptions)];

      build.processFiles(files, (err, referencedFiles) => {
        expect(referencedFiles).to.have.length(1);
        expect(referencedFiles[0]).to.equal(files[0]);
        done();
      });
    });
    it('should return all referenced files, including dependencies', (done) => {
      config = configFactory({
        input: 'src/js/bar.js',
        output: 'js'
      }, {});
      build = buildFactory(config.build[0]);
      const files = [build.fileFactory(build.inputpaths[0], build.fileFactoryOptions)];

      build.processFiles(files, (err, referencedFiles) => {
        expect(referencedFiles).to.have.length(3);
        done();
      });
    });
  });

  describe('run', () => {
    it('should run a simple build', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.run((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.equal(true);
        expect(filepaths[0].toLowerCase()).to.equal(path.resolve('temp/bat.js').toLowerCase());
        done();
      });
    });
    it('should execute a "before" hook before running the build', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.foo="foo";done();');
      build.foo = 'bar';
      build.run((err, filepaths) => {
        expect(build.foo).to.eql('foo');
        done();
      });
    });
    it('should execute an "after" hook after running the build', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.after = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.foo="foo";done();');
      build.foo = 'bar';
      build.run((err, filepaths) => {
        expect(filepaths[0].toLowerCase()).to.eql(path.resolve('temp/bat.js').toLowerCase());
        expect(build.foo).to.eql('foo');
        done();
      });
    });
    it('should execute an "afterEach" hook after each processed file is ready to write to disk', (done) => {
      config = configFactory({
        input: ['src/js/bat.js', 'src/js/baz.js'],
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.afterEach = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.content="foo";done();');
      build.run((err, filepaths) => {
        expect(filepaths[0].toLowerCase()).to.eql(path.resolve('temp/bat.js').toLowerCase());
        expect(fs.readFileSync(filepaths[0], 'utf8')).to.eql('foo');
        done();
      });
    });
    it('should return an error if a "before" hook returns an error', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'done("oops");');
      build.run((err, filepaths) => {
        expect(err).to.be('oops');
        done();
      });
    });
    it('should return an error if an "after" hook returns an error', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'temp'
      }, {});
      build = buildFactory(config.build[0]);
      build.after = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'done("oops");');
      build.run((err, filepaths) => {
        expect(err).to.be('oops');
        done();
      });
    });
  });
});