var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, filelog = require('../lib/utils/filelog');

describe('filelog', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/filelog'));
		filelog.clean();
		filelog.load();
	});
	afterEach(function() {
		filelog.clean();
	});

	describe('add', function() {
		it('should persist added file references to disk', function() {
			var f = ['some' + path.sep + 'file.js', 'some' + path.sep + 'other' + path.sep + 'file.js'];
			var files = filelog.add(f);
			var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
			log.should.eql(f);
		});
		it('should persist relative file paths to disk', function() {
			var f = [path.resolve('some' + path.sep + 'absolute' + path.sep + 'file.js')];
			var files = filelog.add(f);
			var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
			log.should.eql(['some' + path.sep + 'absolute' + path.sep + 'file.js']);
		});
	});

	describe('clean', function() {
		it('should clear all references from disk', function() {
			filelog.clean();
			var log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'));
			log.should.eql([]);
		});
	});
});