'use strict';

const compile = require('..').compile
  , expect = require('expect.js')
  , path = require('path')
  , fs = require('fs')
  , templateCache = require('./templateCache')

  , cache = templateCache.create();

describe('buddy-plugin-dust', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    cache.reset();
  });

  it('should accept a .dust file path and return HTML content', (done) => {
    compile(fs.readFileSync(path.resolve('foo-html.dust'), 'utf8'), {
      filepath: path.resolve('foo-html.dust'),
      cache: cache,
      id: 'foo',
      type: 'html',
      data: { title: 'Title' }}, (err, content) => {
        expect(err).to.be(null);
        expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
        done();
    });
  });
  it('should accept a .dust file path and return HTML content with includes', (done) => {
    const filepath = path.resolve('foo-include-html.dust')
      , includeFilepath = path.resolve(path.dirname(filepath), './include/include.dust');

    compile(fs.readFileSync(filepath, 'utf8').replace('include/include.dust', includeFilepath), {
      filepath: filepath,
      cache: cache,
      id: 'foo',
      type: 'html',
      includes: [
        {
          filepath: includeFilepath,
          content: fs.readFileSync(includeFilepath, 'utf8')
        }
      ],
      data: { title: 'Title' }
    }, (err, content) => {
        expect(err).to.be(null);
        expect(content).to.be.eql(fs.readFileSync(path.resolve('compiled/foo-include.html'), 'utf8'));
        done();
    });
  });
});