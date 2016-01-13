'use strict';

const compile = require('..').compile
  , expect = require('expect.js')
  , path = require('path')
  , fs = require('fs')
  , templateCache = require('./templateCache')

  , cache = templateCache.create();

describe('buddy-plugin-handlebars', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    cache.reset();
  });

  it('should accept a .handlebars file path and return HTML content', (done) => {
    compile(fs.readFileSync(path.resolve('foo-html.handlebars'), 'utf8'), {
      filepath: path.resolve('foo-html.handlebars'),
      cache: cache,
      id: 'foo',
      type: 'html',
      data: { title: 'Title' }}, (err, content) => {
        expect(err).to.be(null);
        expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
        done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.handlebars'), 'utf8'), { filepath: 'foo-bad.handlebars' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});