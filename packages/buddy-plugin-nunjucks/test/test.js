'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../../lib/buddy');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');

let buddy;

describe('buddy-plugin-nunjucks', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    buddy = null;
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });

  it('should build a simple template file', (done) => {
    buddy = buddyFactory({
      input: 'simple.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Title</h1>\n    <p>Test paragraph</p>\n  </body>\n</html>');
      done();
    });
  });
  it('should build a template file with sidecar data file', (done) => {
    buddy = buddyFactory({
      input: 'sidecar.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>foo</title>\n</head>\n<body>\n\n</body>\n</html>');
      done();
    });
  });
  it('should build a nunjucks template file with sidecar data file and includes', (done) => {
    buddy = buddyFactory({
      input: 'includes.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n<head>\n  <title>foo</title>\n</head>\n</head>\n<body>\n\n</body>\n</html>');
      done();
    });
  });
  it('should build a nunjucks template file with inline js dependency', (done) => {
    buddy = buddyFactory({
      input: 'inline.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var foo = \'foo\';</script>\n</head>\n<body>\n\n</body>\n</html>');
      done();
    });
  });
  it('should build a nunjucks template file with inline js dependency needing env substitution', (done) => {
    buddy = buddyFactory({
      input: 'inline-env.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var boop = this\n  , isDev = \'test\' == \'development\';\n\nconsole.log(\'is dev: \', isDev);</script>\n</head>\n<body>\n\n</body>\n</html>');
      done();
    });
  });
  it('should build an html template file with include and inline css dependency', (done) => {
    buddy = buddyFactory({
      input: 'includes-inline.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>foo</title>\n  <style>body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}</style>\n</head>\n<body>\n</body>\n</html>');
      done();
    });
  });
  it('should build an html template file with compressed inline js dependency when "compress" is true', (done) => {
    buddy = buddyFactory({
      input: 'inline-compress.nunjs',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>boo</title>\n  <script>var foo="foo";</script>\n</head>\n<body>\n\n</body>\n</html>');
      done();
    });
  });
  it('should build an html template file with dynamically generated inline svg dependencies', (done) => {
    buddy = buddyFactory({
      input: 'inline-dynamic.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n  <title>foo</title>\n  \n   <svg id="Layer_1" x="0px" y="0px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 100 100">\n<circle cx="50" cy="50" r="25"/>\n</svg>\n  \n   <svg id="Layer_1" x="0px" y="0px" enable-background="new 0 0 100 100" xml:space="preserve" viewBox="0 0 100 100">\n<circle cx="50" cy="50" r="25"/>\n</svg>\n  \n</head>\n<body>\n</body>\n</html>');
      done();
    });
  });
  it('should build a complex template file', (done) => {
    buddy = buddyFactory({
      input: 'complex.nunjs',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('\n<!DOCTYPE html>\n<html>\n<head>\n<head>\n  <title>foo</title>\n  <style>body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}</style>\n</head>\n</head>\n<body>\n\n<div>\n  <label>Username</label>\n</div>\n\n</body>\n</html>');
      done();
    });
  });
});