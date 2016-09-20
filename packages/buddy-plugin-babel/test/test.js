'use strict';

const Cache = require('./fixtures/cache');
const compile = require('..').compile;
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
let options;

describe('buddy-plugin-babel', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    options = {
      cache: Cache.create()
    };
  });

  it('should accept a .js file path and return JS content', (done) => {
    options.filepath = 'foo.js';
    compile(fs.readFileSync(path.resolve('foo.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql('"use strict";\n\nvar nums = [1, 2, 3, 4],\n    fn = nums.map(function (n) {\n  return n + 1;\n});');
      done();
    });
  });
  it('should accept a .jsx file path and return JS content', (done) => {
    options.filepath = 'foo.jsx';
    compile(fs.readFileSync(path.resolve('foo.jsx'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql('"use strict";\n\nvar profile = React.createElement(\n  "div",\n  null,\n  React.createElement("img", { src: "avatar.png", "class": "profile" }),\n  React.createElement(\n    "h3",\n    null,\n    [user.firstName, user.lastName].join(\' \')\n  )\n);');
      done();
    });
  });
  it('should cache helper boilerplate', (done) => {
    options.filepath = 'all.js';
    compile(fs.readFileSync(path.resolve('all.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      const helpers = options.cache.getSource('js-helpers');

      expect(helpers).to.contain('babelHelpers.classCallCheck =');
      expect(helpers).to.contain('babelHelpers.createClass =');
      expect(helpers).to.contain('babelHelpers.defineProperty =');
      expect(helpers).to.contain('babelHelpers.get =');
      expect(helpers).to.contain('babelHelpers.inherits =');
      expect(helpers).to.contain('babelHelpers.possibleConstructorReturn =');
      expect(helpers).to.contain('babelHelpers.taggedTemplateLiteral =');
      done();
    });
  });
  it('should skip a node_modules file path and return original content', (done) => {
    options.filepath = 'node_modules/foo.js';
    compile(fs.readFileSync(path.resolve('foo.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('foo.js'), 'utf8'));
      done();
    });
  });
  it.skip('should remove dead code', (done) => {
    options.filepath = 'dead.js';
    compile(fs.readFileSync(path.resolve('dead.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql('\nfoo();');
      done();
    });
  });
  it.skip('should parse vanilla es5 with dead code options', (done) => {
    options.filepath = 'deadFail.js';
    compile(fs.readFileSync(path.resolve('deadFail.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('compiled/deadFail.js'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    options.filepath = 'foo-bad.js';
    compile(fs.readFileSync(path.resolve('foo-bad.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});