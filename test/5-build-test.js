'use strict';

const expect = require('expect.js');
const fileFactory = require('../lib/file');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const buildFactory = require('../lib/build');
let build;

describe.skip('build', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/build'));
  });
  beforeEach(() => {
    if (!fs.existsSync(path.resolve('temp'))) fs.mkdirSync(path.resolve('temp'));
  });
  afterEach(() => {
    fileFactory.cache.flush();
    rimraf.sync(path.resolve('temp'));
  });

  describe('factory', () => {
    it('should decorate a new build instance with passed data', () => {
      build = buildFactory({
        inputpaths: [path.resolve('src/some.coffee')],
        input: 'src/some.coffee',
        output: 'js',
        fileExtensions: {
          js: ['js', 'json'],
          css: ['css'],
          html: ['html']
        },
        runtimeOptions: {}
      });
      expect(build).to.have.property('output', 'js');
    });
  });

  describe('parse', () => {
    beforeEach(() => {
      build = buildFactory({
        inputpaths: [path.resolve('src/js')],
        outputpaths: [path.resolve('temp')],
        fileExtensions: {
          js: ['js', 'coffee'],
          css: ['css'],
          html: ['html']
        },
        runtimeOptions: {}
      });
    });
    it('should parse a file "input" and return a File instance', () => {
      const files = build.parseFiles([path.resolve('src/js/foo.js')], build.options);

      expect(files).to.have.length(1);
    });
    it('should parse a directory "input" and return several File instances', () => {
      build.inputpath = path.resolve('src/js');
      const files = build.parseFiles([path.resolve('src/js/foo.js'), path.resolve('src/js/bar.js')], build.fileOptions);

      expect(files).to.have.length(2);
    });
  });

  describe('process', () => {
    before(() => {
      build = buildFactory({
        inputpaths: [path.resolve('src/js/bar.js'), path.resolve('src/js/foo.js')],
        fileExtensions: {
          js: ['js', 'json'],
          css: ['css'],
          html: ['html']
        },
        runtimeOptions: {}
      });
    });

    it('should serially apply a set of commands to a collection of items', (done) => {
      const file1 = fileFactory(path.resolve('src/js/foo.js'), build.fileOptions);
      const file2 = fileFactory(path.resolve('src/js/bar.js'), build.fileOptions);

      build.process([file1, file2], [{ js: ['load'] }], false, (err, files) => {
        expect(files[1].content).to.eql("var bat = require(\'./bat\')\n\t, baz = require(\'./baz\')\n\t, bar = this;");
        done();
      });
    });
    it('should return one file reference when processing a file with dependencies', (done) => {
      const file1 = fileFactory(path.resolve('src/js/foo.js'), build.fileOptions);

      build.process([file1], [{ js: ['load', 'parse', 'wrap'] }], false, (err, files) => {
        expect(files).to.have.length(4);
        expect(files[3].content).to.eql("_m_[\'src/js/foo.js\']=(function(module,exports){\n  module=this;exports=module.exports;\n\n  var bar = require(\'./bar\')\n  \t, foo = this;\n\n  return module.exports;\n}).call({exports:{}});");
        done();
      });
    });
  });

  describe('run', () => {
    beforeEach(() => {
      fileFactory.cache.flush();
      build = buildFactory({
        input: 'src/js/foo.js',
        output: 'temp',
        inputpaths: [path.resolve('src/js/foo.js')],
        outputpaths: [path.resolve('temp/foo.js')],
        index: 1,
        compilers: {
          css: '',
          js: '',
          html: ''
        },
        fileExtensions: {
          js: ['js', 'json'],
          css: ['css'],
          html: ['html']
        },
        runtimeOptions: {},
        sources: ['src'],
        workflows: [{ js: ['load', 'compile'] }]
      });
    });
    afterEach(() => {
      build.reset();
    });

    it('should execute a "before" hook before running the build', (done) => {
      build.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.foo="foo";done();');
      build.foo = 'bar';
      build.run((err, filepaths) => {
        expect(build.foo).to.eql('foo');
        done();
      });
    });
    it('should execute an "after" hook after running the build', (done) => {
      build.after = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.foo="foo";done();');
      build.foo = 'bar';
      build.run((err, filepaths) => {
        expect(filepaths[0].toLowerCase()).to.eql(path.resolve('temp/foo.js').toLowerCase());
        expect(build.foo).to.eql('foo');
        done();
      });
    });
    it('should execute an "afterEach" hook after each processed file is ready to write to disk', (done) => {
      build.afterEach = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'context.content="foo";done();');
      build.run((err, filepaths) => {
        expect(filepaths[0].toLowerCase()).to.eql(path.resolve('temp/foo.js').toLowerCase());
        expect(fs.readFileSync(filepaths[0], 'utf8')).to.eql('foo');
        done();
      });
    });
    it('should return an error if a "before" hook returns an error', (done) => {
      build.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'done("oops");');
      build.run((err, filepaths) => {
        expect(err).to.be('oops');
        done();
      });
    });
    it('should return an error if an "after" hook returns an error', (done) => {
      build.after = new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', 'done("oops");');
      build.run((err, filepaths) => {
        expect(err).to.be('oops');
        done();
      });
    });
  });
});