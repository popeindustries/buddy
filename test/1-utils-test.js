'use strict';

const { regexpEscape, truncate } = require('../lib/utils/string');
const expect = require('expect.js');
const filetype = require('../lib/utils/filetype');
const path = require('path');
const pathname = require('../lib/utils/pathname');
const unique = require('../lib/utils/unique');

describe('utils', () => {
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

  describe('unique', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/utils/unique'));
    });

    describe('isUniquePattern()', () => {
      it('should return true for "%hash%" patterns', () => {
        expect(unique.isUniquePattern('foo-%hash%.js')).to.equal(true);
      });
      it('should return true for "%date%" patterns', () => {
        expect(unique.isUniquePattern('foo-%date%.js')).to.equal(true);
      });
      it('should return false for other patterns', () => {
        expect(unique.isUniquePattern('foo-%foo%.js')).to.equal(false);
      });
    });

    describe('find()', () => {
      it('should find a matching file', () => {
        expect(unique.find('foo-bar-%hash%.js')).to.eql(path.resolve('foo-bar-0f7807e7171c078a8c5bfb565e35ef88.js'));
      });
      it('should return "" when no match', () => {
        expect(unique.find('bar-%hash%.js')).to.eql('');
      });
    });

    describe('generate()', () => {
      it('should generate a date based unique filename', () => {
        expect(path.basename(unique.generate('foo-%date%.js', 'var foo = "foo"'))).to.match(/foo\-(\d+)\.js/);
      });
      it('should generate a hash based unique filename', () => {
        expect(path.basename(unique.generate('foo-%hash%.js', 'var foo = "foo"'))).to.match(/foo\-(.+)\.js/);
      });
      it('should remove the unique pattern if no content passed', () => {
        expect(path.basename(unique.generate('foo-%hash%.js'))).to.eql('foo-.js');
      });
      it('should return the passed in pattern when not hash or date', () => {
        expect(path.basename(unique.generate('foo-%foo%.js'))).to.eql('foo-%foo%.js');
      });
    });
  });

  describe('filetype', () => {
    it('should return the correct type for a js filepath', () => {
      expect(filetype('foo.js', {js:['js','json'],css:['css'],html:['html']})).to.eql('js');
    });
    it('should return the correct type for a css filepath', () => {
      expect(filetype('foo.css', {js:['js','json'],css:['css'],html:['html']})).to.eql('css');
    });
    it('should return the correct type for a html filepath', () => {
      expect(filetype('foo.html', {js:['js','json'],css:['css'],html:['html']})).to.eql('html');
    });
    it('should return the correct type for a root html template filepath', () => {
      expect(filetype('foo.nunjs', {js:['js','json'],css:['css'],html:['html','nunjs']})).to.eql('html');
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