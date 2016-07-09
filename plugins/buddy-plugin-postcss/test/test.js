'use strict';

const compile = require('..').compile;
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

describe('buddy-plugin-postcss', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .css file path and return CSS content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.css'), 'utf8'), { filepath: 'foo.css' }, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.equal(fs.readFileSync(path.resolve('compiled/foo.css'), 'utf8'));
      done();
    });
  });

  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.css'), 'utf8'), { filepath: 'foo-bad.css' }, (err, content) => {
      expect(err.message).to.contain('Unclosed block');
      done();
    });
  });
});
