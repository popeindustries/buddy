'use strict';

const compile = require('..').compile
  , expect = require('expect.js')
  , path = require('path')
  , fs = require('fs');

describe('buddy-plugin-less', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .less file path and return CSS content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.less'), 'utf8'), null, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.css'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.less'), 'utf8'), { filepath: 'foo-bad.less' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});