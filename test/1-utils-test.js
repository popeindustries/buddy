var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, filelog = require('../lib/utils/filelog')
	, unique = require('../lib/utils/unique');

describe('utils', function () {
	describe('filelog', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/utils/filelog'));
			filelog.clean();
			filelog.load();
		});
		afterEach(function () {
			filelog.clean();
		});

		describe('add()', function () {
			it('should persist added file references to disk', function () {
				var f = ['some' + path.sep + 'file.js', 'some' + path.sep + 'other' + path.sep + 'file.js'];
				var files = filelog.add(f);
				var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
				log.should.eql(f);
			});
			it('should persist relative file paths to disk', function () {
				var f = [path.resolve('some' + path.sep + 'absolute' + path.sep + 'file.js')];
				var files = filelog.add(f);
				var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
				log.should.eql(['some' + path.sep + 'absolute' + path.sep + 'file.js']);
			});
		});

		describe('clean()', function () {
			it('should clear all references from disk', function () {
				filelog.clean();
				var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
				log.should.eql([]);
			});
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
				path.basename(unique.generate('foo-%date%.js')).should.match(/foo\-(\d+)\.js/);
			});
			it('should generate a hash based unique filename', function () {
				path.basename(unique.generate('foo-%hash%.js', 'var foo = "foo"')).should.match(/foo\-(.+)\.js/);
			});
			it('should return the passed in pattern when not hash or date', function () {
				path.basename(unique.generate('foo-%foo%.js')).should.eql('foo-%foo%.js');
			});
		});
	});
});