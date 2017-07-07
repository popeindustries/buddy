'use strict';

const {
  commentStrip,
  sourceMapCommentStrip,
  commentWrap,
  indent,
  uniqueMatch,
  regexpEscape,
  truncate,
  getLocationFromIndex
} = require('../../lib/utils/string');
const expect = require('expect.js');
const path = require('path');

describe('string', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });

  describe('commentStrip()', () => {
    it('should remove single line comment', () => {
      expect(commentStrip('// foo\nvar foo;')).to.equal('\nvar foo;');
      expect(commentStrip('# foo\nvar foo;')).to.equal('\nvar foo;');
    });
    it('should remove single line comment with leading whitespace', () => {
      expect(commentStrip('  // foo\nvar foo;')).to.equal('\nvar foo;');
      expect(commentStrip('  # foo\nvar foo;')).to.equal('\nvar foo;');
    });
    it('should remove multi-line comment', () => {
      expect(commentStrip('/**\n  foo\n*/\nvar foo;')).to.equal('\nvar foo;');
      expect(commentStrip('/*\n  foo\n*/\nvar foo;')).to.equal('\nvar foo;');
    });
    it('should remove multi-line comment on single line', () => {
      expect(commentStrip('/** foo*/\nvar foo;')).to.equal('\nvar foo;');
    });
  });

  describe('sourceMapCommentStrip()', () => {
    it('should remove source map comment', () => {
      expect(sourceMapCommentStrip('var foo;\n//# sourceMappingURL="foo.map"')).to.equal('var foo;')
    });
  });

  describe('commentWrap()', () => {
    it('should wrap html string in comment', () => {
      expect(commentWrap('<br>', 'html')).to.equal('<!-- <br> -->');
    });
    it('should wrap css string in comment', () => {
      expect(commentWrap('background-color: red;', 'css')).to.equal('/* background-color: red; */');
    });
    it('should wrap js string in comment', () => {
      expect(commentWrap('var foo;', 'js')).to.equal('/* var foo; */');
    });
  });

  describe('indent()', () => {
    it('should not indent a string if no column value passed', () => {
      expect(indent('foo')).to.equal('foo');
    });
    it('should indent a string n columns', () => {
      expect(indent('foo', 2)).to.equal('  foo');
    });
  })

  describe('uniqueMatch()', () => {
    it('should match a simple string', () => {
      expect(uniqueMatch('foo bar', /foo/g)).to.eql([{ context: 'foo', id: '', match: '' }]);
    });
    it('should match a simple string with capture group', () => {
      expect(uniqueMatch('foo bar', /fo(o)/g)).to.eql([{ context: 'foo', id: 'o', match: 'o' }]);
    });
    it('should uniquely match multiple instances', () => {
      expect(uniqueMatch('foo bar foo', /fo(o)/g)).to.eql([{ context: 'foo', id: 'o', match: 'o' }]);
    });
  });

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
      expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.equal(
        'foo/bar/boo/bat/bing/boooooooo...oooong/buuuuuuuuuuuuuuuuuuuung'
      );
      expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.have.length(63);
    });
  });

  describe('getLocationFromIndex()', () => {
    it('should return location in single line text', () => {
      expect(getLocationFromIndex('foo bar boo', 4)).to.eql({ line: 1, column: 4 });
    });
    it('should return location in multiple line text', () => {
      expect(getLocationFromIndex('foo\nbar\nboo', 4)).to.eql({ line: 2, column: 0 });
    });
    it('should return identity location for invalid index', () => {
      expect(getLocationFromIndex('foo\nbar\nboo', 40000)).to.eql({ line: 0, column: 0 });
    });
    it('should return multiple locations in single line text', () => {
      expect(getLocationFromIndex('foo bar boo', [4, 6])).to.eql([{ line: 1, column: 4 }, { line: 1, column: 6 }]);
    });
    it('should return multiple locations in multiple line text', () => {
      expect(getLocationFromIndex('foo\nbar\nboo', [4, 8])).to.eql([{ line: 2, column: 0 }, { line: 3, column: 0 }]);
    });
  });
});
