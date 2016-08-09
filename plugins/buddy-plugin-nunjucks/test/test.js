'use strict';

const compile = require('..').compile;
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const templateCache = require('./templateCache');
const cache = templateCache.create();

describe('buddy-plugin-nunjucks', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    cache.reset();
  });

  it('should accept a .nunjucks file path and return HTML content', (done) => {
    compile(fs.readFileSync(path.resolve('foo-html.nunjucks'), 'utf8'), {
      filepath: path.resolve('foo-html.nunjucks'),
      cache: cache,
      id: 'foo',
      type: 'html',
      data: { title: 'Title' } }, (err, content) => {
        expect(err).to.eql(null);
        expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
        done();
    });
  });
  it('should accept a .nunjucks file path and return HTML content with includes', (done) => {
    const filepath = path.resolve('foo-include-html.nunjucks');
    const includeFilepath = path.resolve(path.dirname(filepath), './include/include.nunjucks');

    compile(fs.readFileSync(filepath, 'utf8').replace('include/include.nunjucks', includeFilepath), {
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
      data: { title:'Title' }
    }, (err, content) => {
        expect(err).to.eql(null);
        expect(content).to.eql(fs.readFileSync(path.resolve('compiled/foo-include.html'), 'utf8'));
        done();
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    compile(fs.readFileSync(path.resolve('foo-bad.nunjucks'), 'utf8'), { filepath: 'foo-bad.nunjucks' }, (err, content) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});