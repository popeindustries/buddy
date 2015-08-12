'use strict';

var expect = require('expect.js')
	, filetype = require('../lib/utils/filetype')
	, fs = require('fs')
	, path = require('path')
	, pathname = require('../lib/utils/pathname')
	, reEscape = require('../lib/utils/reEscape')
	, truncate = require('../lib/utils/truncate')
	, unique = require('../lib/utils/unique');

describe('utils', function () {
	describe('reEscape', function () {
		it('should ignore valid characters', function () {
			expect(reEscape('foo')).to.equal('foo');
		});
		it('should escape special RegExp characters', function () {
			expect(reEscape('foo/.&')).to.equal('foo\\/\\.&');
		});
	});

	describe('truncate', function () {
		it('should ignore short strings', function () {
			expect(truncate('foo/bar')).to.equal('foo/bar');
		});
		it('should truncate long strings', function () {
			expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.equal('foo/bar/boo/bat/bing/boooooooo...oooong/buuuuuuuuuuuuuuuuuuuung');
			expect(truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung')).to.have.length(63);
		});
	});

	describe('unique', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/utils/unique'));
		});

		describe('isUniquePattern()', function () {
			it('should return true for "%hash%" patterns', function () {
				expect(unique.isUniquePattern('foo-%hash%.js')).to.equal(true);
			});
			it('should return true for "%date%" patterns', function () {
				expect(unique.isUniquePattern('foo-%date%.js')).to.equal(true);
			});
			it('should return false for other patterns', function () {
				expect(unique.isUniquePattern('foo-%foo%.js')).to.equal(false);
			});
		});

		describe('find()', function () {
			it('should find a matching file', function () {
				expect(unique.find('foo-%hash%.js')).to.eql(path.resolve('foo-00000.js'));
			});
			it('should return "" when no match', function () {
				expect(unique.find('bar-%hash%.js')).to.eql('');
			});
		});

		describe('generate()', function () {
			it('should generate a date based unique filename', function () {
				expect(path.basename(unique.generate('foo-%date%.js', 'var foo = "foo"'))).to.match(/foo\-(\d+)\.js/);
			});
			it('should generate a hash based unique filename', function () {
				expect(path.basename(unique.generate('foo-%hash%.js', 'var foo = "foo"'))).to.match(/foo\-(.+)\.js/);
			});
			it('should remove the unique pattern if no content passed', function () {
				expect(path.basename(unique.generate('foo-%hash%.js'))).to.eql('foo-.js');
			});
			it('should return the passed in pattern when not hash or date', function () {
				expect(path.basename(unique.generate('foo-%foo%.js'))).to.eql('foo-%foo%.js');
			});
		});
	});

	describe('filetype', function () {
		it('should return the correct type for a js filepath', function () {
			expect(filetype('foo.js', {js:['js','json'],css:['css'],html:['html']})).to.eql('js');
		});
		it('should return the correct type for a css filepath', function () {
			expect(filetype('foo.css', {js:['js','json'],css:['css'],html:['html']})).to.eql('css');
		});
		it('should return the correct type for a html filepath', function () {
			expect(filetype('foo.html', {js:['js','json'],css:['css'],html:['html']})).to.eql('html');
		});
		it('should return the correct type for a root html template filepath', function () {
			expect(filetype('foo.nunjs', {js:['js','json'],css:['css'],html:['html','nunjs']})).to.eql('html');
		});
	});

	describe('pathname', function () {
		it('should return the dir/file name of a file', function () {
			expect(pathname(__filename)).to.equal('test/1-utils-test.js');
		});
		it('should return the dir/file name of a file relative to current directory', function () {
			expect(pathname('package.json')).to.equal('./package.json');
		});
	});
});