'use strict';

const compile = require('..').compile;
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

describe('buddy-plugin-stylus', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .styl file path and return CSS content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.styl'), 'utf8'), null, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.css'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.styl'), 'utf8'), { filepath: 'foo-bad.styl' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});