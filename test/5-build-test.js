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
      build = buildFactory(config.builds[0]);

      expect(build).to.have.property('output', 'js');
      expect(build).to.have.property('fileFactory');
    });
    it('should generate an "inputString" for simple "input"', () => {
      config = configFactory({
        input: 'src/js/foo.js',
        output: 'js'
      }, {});
      build = buildFactory(config.builds[0]);

      expect(build).to.have.property('inputString', 'js/foo.js');
    });
    it('should generate an "inputString" for complex "input"', () => {
      config = configFactory({
        input: ['src/js/foo.js', 'src/js/bar.js'],
        output: 'js'
      }, {});
      build = buildFactory(config.builds[0]);

      expect(build).to.have.property('inputString', 'js/foo.js, js/bar.js');
    });
    it('should generate a trimmed "inputString" for long, complex "input"', () => {
      config = configFactory({
        input: 'src/js',
        output: 'js'
      }, {});
      build = buildFactory(config.builds[0]);

      expect(build).to.have.property('inputString', 'js/bar.js, js/bat.js, js/baz.js ...and 1 other');
    });
  });

  describe('initFiles()', () => {
    it('should return File instances', (done) => {
      config = configFactory({
        input: 'src/js/bat.js',
        output: 'js'
      }, {});
      build = buildFactory(config.builds[0]);
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
      build = buildFactory(config.builds[0]);
      const files = [build.fileFactory(build.inputpaths[0])];

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
      build = buildFactory(config.builds[0]);
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
      build = buildFactory(config.builds[0]);
      build.run((err, results) => {
        expect(fs.existsSync(results[0].filepath)).to.equal(true);
        expect(results[0].filepath.toLowerCase()).to.equal(path.resolve('temp/bat.js').toLowerCase());
        done();
      });
    });
  });
});