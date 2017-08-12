'use strict';

const { expect } = require('chai');
const {
  isAbsoluteFilepath,
  isRelativeFilepath,
  isFilepath,
  isUniqueFilepath,
  filepathName,
  filepathType,
  findFilepath,
  findUniqueFilepath,
  generateUniqueFilepath
} = require('../../lib/utils/filepath');
const path = require('path');

describe('filepath', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/unique'));
  });

  describe('isAbsoluteFilepath()', () => {
    it('should return "true" for absolute path', () => {
      expect(isAbsoluteFilepath(__filename)).to.equal(true);
    });
    it('should return "false" for empty path', () => {
      expect(isAbsoluteFilepath()).to.equal(false);
    });
    it('should return "false" for relative path', () => {
      expect(isAbsoluteFilepath('./foo.js')).to.equal(false);
    });
  });

  describe('isRelativeFilepath()', () => {
    it('should return "true" for relative path', () => {
      expect(isRelativeFilepath('./foo.js')).to.equal(true);
    });
    it('should return "false" for empty path', () => {
      expect(isRelativeFilepath()).to.equal(false);
    });
    it('should return "false" for absolute path', () => {
      expect(isRelativeFilepath(__filename)).to.equal(false);
    });
  });

  describe('isFilepath()', () => {
    it('should return "true" for relative path', () => {
      expect(isFilepath('./foo.js')).to.equal(true);
    });
    it('should return "true" for absolute path', () => {
      expect(isFilepath(__filename)).to.equal(true);
    });
    it('should return "false" for empty path', () => {
      expect(isFilepath()).to.equal(false);
    });
  });

  describe('isUniqueFilepath()', () => {
    it('should return true for "%hash%" patterns', () => {
      expect(isUniqueFilepath('foo-%hash%.js')).to.equal(true);
    });
    it('should return true for "%date%" patterns', () => {
      expect(isUniqueFilepath('foo-%date%.js')).to.equal(true);
    });
    it('should return false for other patterns', () => {
      expect(isUniqueFilepath('foo-%foo%.js')).to.equal(false);
    });
  });

  describe('filepathName()', () => {
    it('should return the dir/file name of a file', () => {
      expect(filepathName(__filename)).to.equal('utils/filepath-test.js');
    });
    it('should return the dir/file name of a file relative to current directory', () => {
      expect(filepathName('package.json')).to.equal('./package.json');
    });
  });

  describe('filepathType()', () => {
    it('should return the correct type for a js filepath', () => {
      expect(filepathType('foo.js', { js: ['js', 'json'], css: ['css'], html: ['html'] })).to.eql('js');
    });
    it('should return the correct type for a css filepath', () => {
      expect(filepathType('foo.css', { js: ['js', 'json'], css: ['css'], html: ['html'] })).to.eql('css');
    });
    it('should return the correct type for a html filepath', () => {
      expect(filepathType('foo.html', { js: ['js', 'json'], css: ['css'], html: ['html'] })).to.eql('html');
    });
    it('should return the correct type for a root html template filepath', () => {
      expect(filepathType('foo.nunjs', { js: ['js', 'json'], css: ['css'], html: ['html', 'nunjs'] })).to.eql(
        'html'
      );
    });
  });

  describe('findFilepath()', () => {
    it('should find an existing file', () => {
      expect(findFilepath(__filename, 'js', { })).to.eql(__filename);
    });
    it('should find a file with missing extension', () => {
      expect(findFilepath(__filename.replace('.js' , ''), 'js', { js: ['js', 'json'] })).to.eql(__filename);
    });
    it('should find a file with missing extension for alternative extension type', () => {
      expect(findFilepath(path.resolve('bar'), 'js', { js: ['js', 'json'] })).to.eql(path.resolve('bar.json'));
    });
    it('should find a package index file', () => {
      expect(findFilepath(process.cwd(), 'js', { js: ['js', 'json'] })).to.eql(path.resolve('index.js'));
    });
  });

  describe('findUniqueFilepath()', () => {
    it('should find a matching file', () => {
      expect(findUniqueFilepath('foo-bar-%hash%.js')).to.eql(
        path.resolve('foo-bar-0f7807e7171c078a8c5bfb565e35ef88.js')
      );
    });
    it('should return "" when no match', () => {
      expect(findUniqueFilepath('bar-%hash%.js')).to.eql('');
    });
  });

  describe('generateUniqueFilepath()', () => {
    it('should generate a date based unique filename', () => {
      expect(path.basename(generateUniqueFilepath('foo-%date%.js', 'var foo = "foo"'))).to.match(
        /foo\-(\d+)\.js/
      );
    });
    it('should generate a hash based unique filename', () => {
      expect(path.basename(generateUniqueFilepath('foo-%hash%.js', 'var foo = "foo"'))).to.match(
        /foo\-(.+)\.js/
      );
    });
    it('should remove the unique pattern if no content passed', () => {
      expect(path.basename(generateUniqueFilepath('foo-%hash%.js'))).to.eql('foo-.js');
    });
    it('should return the passed in pattern when not hash or date', () => {
      expect(path.basename(generateUniqueFilepath('foo-%foo%.js'))).to.eql('foo-%foo%.js');
    });
  });
});
