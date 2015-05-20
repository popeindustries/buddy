'use strict';

var filetype = require('../lib/utils/filetype')
	, fs = require('fs')
	, path = require('path')
	, pathname = require('../lib/utils/pathname')
	, reEscape = require('../lib/utils/reEscape')
	, truncate = require('../lib/utils/truncate')
	, unique = require('../lib/utils/unique');

describe('utils', function () {
	describe('reEscape', function () {
		it('should ignore valid characters', function () {
			reEscape('foo').should.equal('foo');
		});
		it('should escape special RegExp characters', function () {
			reEscape('foo/.&').should.equal('foo\\/\\.&');
		});
	});

	describe('truncate', function () {
		it('should ignore short strings', function () {
			truncate('foo/bar').should.equal('foo/bar');
		});
		it('should truncate long strings', function () {
			truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung').should.equal('foo/bar/boo/bat/bing/boooooooo...oooong/buuuuuuuuuuuuuuuuuuuung');
			truncate('foo/bar/boo/bat/bing/booooooooooooooooooong/buuuuuuuuuuuuuuuuuuuung').should.have.length(63);
		});
	});

	describe('unique', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/utils/unique'));
		});

		describe('isUniquePattern()', function () {
			it('should return true for "%hash%" patterns', function () {
				unique.isUniquePattern('foo-%hash%.js').should.be.true;
			});
			it('should return true for "%date%" patterns', function () {
				unique.isUniquePattern('foo-%date%.js').should.be.true;
			});
			it('should return false for other patterns', function () {
				unique.isUniquePattern('foo-%foo%.js').should.be.false;
			});
		});

		describe('find()', function () {
			it('should find a matching file', function () {
				unique.find('foo-%hash%.js').should.eql(path.resolve('foo-00000.js'));
			});
			it('should return "" when no match', function () {
				unique.find('bar-%hash%.js').should.eql('');
			});
		});

		describe('generate()', function () {
			it('should generate a date based unique filename', function () {
				path.basename(unique.generate('foo-%date%.js', 'var foo = "foo"')).should.match(/foo\-(\d+)\.js/);
			});
			it('should generate a hash based unique filename', function () {
				path.basename(unique.generate('foo-%hash%.js', 'var foo = "foo"')).should.match(/foo\-(.+)\.js/);
			});
			it('should remove the unique pattern if no content passed', function () {
				path.basename(unique.generate('foo-%hash%.js')).should.eql('foo-.js');
			});
			it('should return the passed in pattern when not hash or date', function () {
				path.basename(unique.generate('foo-%foo%.js')).should.eql('foo-%foo%.js');
			});
		});
	});

	describe('filetype', function () {
		it('should return the correct type for a js filepath', function () {
			filetype('foo.js', false, null, {js:['js','json'],css:['css'],html:['html']}).should.eql('js');
		});
		it('should return the correct type for a css filepath', function () {
			filetype('foo.css', false, null, {js:['js','json'],css:['css'],html:['html']}).should.eql('css');
		});
		it('should return the correct type for a html filepath', function () {
			filetype('foo.html', false, null, {js:['js','json'],css:['css'],html:['html']}).should.eql('html');
		});
		it('should return the correct type for a root html template filepath', function () {
			filetype('foo.nunjs', true, null, {js:['js','json','nunjs'],css:['css'],html:['html','nunjs']}).should.eql('html');
		});
		it('should return the correct type for a dependency html template filepath', function () {
			filetype('foo.nunjs', false, 'html', {js:['js','json','nunjs'],css:['css'],html:['html','nunjs']}).should.eql('html');
		});
		it('should return the correct type for a precompiled html template filepath', function () {
			filetype('foo.nunjs', false, 'js', {js:['js','json','nunjs'],css:['css'],html:['html','nunjs']}).should.eql('js');
		});
	});

	describe('pathname', function () {
		it('should return the dir/file name of a file', function () {
			pathname(__filename).should.equal('test/1-utils-test.js');
		});
		it('should return the dir/file name of a file relative to current directory', function () {
			pathname('package.json').should.equal('./package.json');
		});
	});
});