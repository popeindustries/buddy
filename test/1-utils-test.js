'use strict';

const { regexpEscape, truncate, uniqueMatch } = require('../lib/utils/string');
const callable = require('../lib/utils/callable');
const expect = require('expect.js');
const filepath = require('../lib/utils/filepath');
const fs = require('fs');
const path = require('path');
const sourceMap = require('../lib/utils/sourceMap');
const stopwatch = require('../lib/utils/stopwatch');

describe('utils', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/utils'));
  });

  describe('callable', () => {
    it('should return a function bound to passed context', () => {
      const obj = {
        bar: 0,
        foo () {
          this.bar++;
        }
      };
      const fn = callable(obj, 'foo');

      fn();
      expect(obj.bar).to.equal(1);
    });
    it('should return a function with memoized arguments', () => {
      const obj = {
        bar: 0,
        foo (val) {
          this.bar = val;
        }
      };
      const fn = callable(obj, 'foo', 2);

      fn();
      expect(obj.bar).to.equal(2);
    });
    it('should return a function accepting passed arguments', () => {
      const obj = {
        bar: 0,
        foo (val) {
          this.bar = val;
        }
      };
      const fn = callable(obj, 'foo');

      fn(2);
      expect(obj.bar).to.equal(2);
    });
  });

  describe('string', () => {
    describe('regexpEscape()', () => {
      it('should ignore valid characters', () => {
        expect(regexpEscape('foo')).to.equal('foo');
      });
      it('should escape special RegExp characters', () => {
        expect(regexpEscape('foo/.&')).to.equal('foo\\/\\.&');
      });
    });

    describe('truncate()', () => {
      it('should ignore short strings', () => {
        expect(truncate('foo/bar')).to.equal('foo/bar');
      });
      it('should truncate long strings', () => {
        expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.equal('foo/bar/boo/bat/bing/boooooooo...oooong/buuuuuuuuuuuuuuuuuuuung');
        expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.have.length(63);
      });
    });

    describe('uniqueMatch()', () => {
      it('should match a simple string', () => {
        expect(uniqueMatch('foo bar', /foo/g)).to.eql([{ context: 'foo', match: '' }]);
      });
      it('should match a simple string with capture group', () => {
        expect(uniqueMatch('foo bar', /fo(o)/g)).to.eql([{ context: 'foo', match: 'o' }]);
      });
      it('should uniquely match multiple instances', () => {
        expect(uniqueMatch('foo bar foo', /fo(o)/g)).to.eql([{ context: 'foo', match: 'o' }]);
      });
    });
  });

  describe('filepath', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/utils/unique'));
    });
    after(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/utils'));
    });

    describe('filepathType()', () => {
      it('should return the correct type for a js filepath', () => {
        expect(filepath.filepathType('foo.js', {js:['js','json'],css:['css'],html:['html']})).to.eql('js');
      });
      it('should return the correct type for a css filepath', () => {
        expect(filepath.filepathType('foo.css', {js:['js','json'],css:['css'],html:['html']})).to.eql('css');
      });
      it('should return the correct type for a html filepath', () => {
        expect(filepath.filepathType('foo.html', {js:['js','json'],css:['css'],html:['html']})).to.eql('html');
      });
      it('should return the correct type for a root html template filepath', () => {
        expect(filepath.filepathType('foo.nunjs', {js:['js','json'],css:['css'],html:['html','nunjs']})).to.eql('html');
      });
    });

    describe('isUniqueFilepath()', () => {
      it('should return true for "%hash%" patterns', () => {
        expect(filepath.isUniqueFilepath('foo-%hash%.js')).to.equal(true);
      });
      it('should return true for "%date%" patterns', () => {
        expect(filepath.isUniqueFilepath('foo-%date%.js')).to.equal(true);
      });
      it('should return false for other patterns', () => {
        expect(filepath.isUniqueFilepath('foo-%foo%.js')).to.equal(false);
      });
    });

    describe('findUniqueFilepath()', () => {
      it('should find a matching file', () => {
        expect(filepath.findUniqueFilepath('foo-bar-%hash%.js')).to.eql(path.resolve('foo-bar-0f7807e7171c078a8c5bfb565e35ef88.js'));
      });
      it('should return "" when no match', () => {
        expect(filepath.findUniqueFilepath('bar-%hash%.js')).to.eql('');
      });
    });

    describe('generate()', () => {
      it('should generate a date based unique filename', () => {
        expect(path.basename(filepath.generateUniqueFilepath('foo-%date%.js', 'var foo = "foo"'))).to.match(/foo\-(\d+)\.js/);
      });
      it('should generate a hash based unique filename', () => {
        expect(path.basename(filepath.generateUniqueFilepath('foo-%hash%.js', 'var foo = "foo"'))).to.match(/foo\-(.+)\.js/);
      });
      it('should remove the unique pattern if no content passed', () => {
        expect(path.basename(filepath.generateUniqueFilepath('foo-%hash%.js'))).to.eql('foo-.js');
      });
      it('should return the passed in pattern when not hash or date', () => {
        expect(path.basename(filepath.generateUniqueFilepath('foo-%foo%.js'))).to.eql('foo-%foo%.js');
      });
    });

    describe('filepathName()', () => {
      it('should return the dir/file name of a file', () => {
        expect(filepath.filepathName(__filename)).to.equal('test/1-utils-test.js');
      });
      it('should return the dir/file name of a file relative to current directory', () => {
        expect(filepath.filepathName('package.json')).to.equal('./package.json');
      });
    });
  });

  describe('stopwatch', () => {
    afterEach(() => {
      stopwatch.clear('test');
    });

    it('should start and stop with elapsed duration', (done) => {
      stopwatch.start('test');
      setTimeout(() => {
        const elapsed = stopwatch.stop('test');

        expect(elapsed).to.be.within(490, 510);
        done();
      }, 500);
    });
    it('should start and stop with formatted duration in ms', (done) => {
      stopwatch.start('test');
      setTimeout(() => {
        const elapsed = stopwatch.stop('test', true);

        expect(elapsed).to.match(/^5[0-9]{2}ms$/);
        done();
      }, 500);
    });
    it('should start and stop with formatted duration in s', (done) => {
      stopwatch.start('test');
      setTimeout(() => {
        const elapsed = stopwatch.stop('test', true);

        expect(elapsed).to.match(/^1\.[0-9]{1,2}s$/);
        done();
      }, 1100);
    });
  });

  describe.only('sourceMap', () => {
    describe('create()', () => {
      it('should create a source map from file content and url', () => {
        const map = sourceMap.create(fs.readFileSync(path.resolve('foo.js'), 'utf8'), 'foo.js');

        expect(map.toString()).to.equal('{"version":3,"sources":["foo.js"],"names":[],"mappings":"AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA","file":"foo.js","sourcesContent":["\'use strict\';\\n\\nconst foo = require(\'foo\');\\nconst bar = require(\'bar\');\\n\\nconst FOO = \'FOO\';\\n\\nmodule.exports = function foo () {\\n  console.log(foo || FOO);\\n};"]}');
      });
      it('should create a source map from file content with default url', () => {
        const map = sourceMap.create(fs.readFileSync(path.resolve('foo.js'), 'utf8'));

        expect(JSON.parse(map.toString())).to.have.property('file', '<source>');
      });
    });

    describe('append()', () => {

    });
  });
});