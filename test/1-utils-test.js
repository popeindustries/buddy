'use strict';

const { regexpEscape, truncate, uniqueMatch } = require('../lib/utils/string');
const callable = require('../lib/utils/callable');
const expect = require('expect.js');
const path = require('path');
const pathname = require('../lib/utils/pathname');
const tree = require('../lib/utils/tree');
const uniqueFilepath = require('../lib/utils/uniqueFilepath');

describe('utils', () => {
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
    describe('regexpEscape', () => {
      it('should ignore valid characters', () => {
        expect(regexpEscape('foo')).to.equal('foo');
      });
      it('should escape special RegExp characters', () => {
        expect(regexpEscape('foo/.&')).to.equal('foo\\/\\.&');
      });
    });

    describe('truncate', () => {
      it('should ignore short strings', () => {
        expect(truncate('foo/bar')).to.equal('foo/bar');
      });
      it('should truncate long strings', () => {
        expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.equal('foo/bar/boo/bat/bing/boooooooo...oooong/buuuuuuuuuuuuuuuuuuuung');
        expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.have.length(63);
      });
    });

    describe('uniqueMatch', () => {
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

  describe('uniqueFilepath', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/utils/unique'));
    });

    describe('isUniquePattern()', () => {
      it('should return true for "%hash%" patterns', () => {
        expect(uniqueFilepath.isUniquePattern('foo-%hash%.js')).to.equal(true);
      });
      it('should return true for "%date%" patterns', () => {
        expect(uniqueFilepath.isUniquePattern('foo-%date%.js')).to.equal(true);
      });
      it('should return false for other patterns', () => {
        expect(uniqueFilepath.isUniquePattern('foo-%foo%.js')).to.equal(false);
      });
    });

    describe('findFile()', () => {
      it('should find a matching file', () => {
        expect(uniqueFilepath.findFile('foo-bar-%hash%.js')).to.eql(path.resolve('foo-bar-0f7807e7171c078a8c5bfb565e35ef88.js'));
      });
      it('should return "" when no match', () => {
        expect(uniqueFilepath.findFile('bar-%hash%.js')).to.eql('');
      });
    });

    describe('generate()', () => {
      it('should generate a date based unique filename', () => {
        expect(path.basename(uniqueFilepath.generate('foo-%date%.js', 'var foo = "foo"'))).to.match(/foo\-(\d+)\.js/);
      });
      it('should generate a hash based unique filename', () => {
        expect(path.basename(uniqueFilepath.generate('foo-%hash%.js', 'var foo = "foo"'))).to.match(/foo\-(.+)\.js/);
      });
      it('should remove the unique pattern if no content passed', () => {
        expect(path.basename(uniqueFilepath.generate('foo-%hash%.js'))).to.eql('foo-.js');
      });
      it('should return the passed in pattern when not hash or date', () => {
        expect(path.basename(uniqueFilepath.generate('foo-%foo%.js'))).to.eql('foo-%foo%.js');
      });
    });
  });

  describe('pathname', () => {
    it('should return the dir/file name of a file', () => {
      expect(pathname(__filename)).to.equal('test/1-utils-test.js');
    });
    it('should return the dir/file name of a file relative to current directory', () => {
      expect(pathname('package.json')).to.equal('./package.json');
    });
  });
});