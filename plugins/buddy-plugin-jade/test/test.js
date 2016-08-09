'use strict';

const compile = require('..').compile;
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

describe('buddy-plugin-jade', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .jade file path and return HTML content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.jade'), 'utf8'), { type: 'html', data: { title: 'Title' }}, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.jade'), 'utf8'), { filepath: 'foo-bad.jade' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});