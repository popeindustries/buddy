'use strict';

const compile = require('..').compile;
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

describe('buddy-plugin-coffeescript', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .coffee file path and return JS content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.coffee'), 'utf8'), null, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.js'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.coffee'), 'utf8'), { filepath: 'foo-bad.coffee' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
  it('should append the filepath to a returned error object', (done) => {
    compile('', { filepath: 'foo-bad.coffee' }, (err, content) => {
      expect(err).to.be.an(Error);
      expect(err.filepath).to.eql('foo-bad.coffee');
      done();
    });
  });
});