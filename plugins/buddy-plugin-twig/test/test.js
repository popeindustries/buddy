'use strict';

const compile = require('..').compile
  , expect = require('expect.js')
  , path = require('path')
  , fs = require('fs');

describe('buddy-plugin-twig', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should accept a .twig file path and return HTML content', (done) => {
    compile(fs.readFileSync(path.resolve('foo.twig'), 'utf8'), {
      heading: 'Cats cats cats!',
      type: 'html',
      filepath: path.resolve('foo.twig')
    }, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.be.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
      done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.twig'), 'utf8'), { filepath: 'foo-bad.twig' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});