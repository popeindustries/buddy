const buddyFactory = require('../../lib/buddy');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
let buddy;

describe('CSS', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });
  after(() => {
    ['yarn.lock', 'node_modules', 'package.json'].forEach(p => {
      if (fs.existsSync(path.resolve(p))) rimraf.sync(path.resolve(p));
    });
  });

  it('should build a css file', done => {
    buddy = buddyFactory({
      input: 'a.css',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n');
      done();
    });
  });
  it('should build a css file with inlined dependencies', done => {
    buddy = buddyFactory({
      input: 'b.css',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        'body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n\n\ndiv {\n  color: red;\n}'
      );
      done();
    });
  });
  it('should build a minified css file if "compress" is true', done => {
    buddy = buddyFactory(
      {
        input: 'a.css',
        output: 'output'
      },
      { compress: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('body{color:#fff;font-size:12px}body p{font-size:10px}');
      done();
    });
  });
  it('should build a minified css file with options', done => {
    buddy = buddyFactory(
      {
        input: 'd.css',
        output: 'output',
        options: {
          cssnano: {
            normalizeUrl: false
          }
        }
      },
      { compress: true }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('.box{background:url("./css/../img/cat.jpg")}');
      done();
    });
  });
  it('should build a file with prefixes', done => {
    buddy = buddyFactory({
      input: 'c.css',
      output: 'output',
      version: { browsers: ['last 5 versions'] }
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        ':-webkit-full-screen a {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n}\n:-moz-full-screen a {\n  display: flex;\n}\n:-ms-fullscreen a {\n  display: -ms-flexbox;\n  display: flex;\n}\n:fullscreen a {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}'
      );
      done();
    });
  });
  it('should build a file with prefixes using simplified version string', done => {
    buddy = buddyFactory({
      input: 'c.css',
      output: 'output',
      version: 'last 5 versions'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain(
        ':-webkit-full-screen a {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n}\n:-moz-full-screen a {\n  display: flex;\n}\n:-ms-fullscreen a {\n  display: -ms-flexbox;\n  display: flex;\n}\n:fullscreen a {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}'
      );
      done();
    });
  });
});
