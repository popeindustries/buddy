var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, compress = require('../lib/utils/compress')
	, escape = require('../lib/utils/escape')
	, parse = require('../lib/utils/parse')
	, wrap = require('../lib/utils/wrap');

describe('utils', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/utils'));
	});

	describe('escape', function() {
		it('should transform js file contents into an escaped string', function() {
			escape(fs.readFileSync(path.resolve('main.js'), 'utf8')).should.eql("\"var bar = require('./package/bar')\\n\t, foo = require('./package/foo');\"");
		});
	});

	describe('compress', function() {
		it('should compress js file contents', function(done) {
			compress('js', fs.readFileSync(path.resolve('main.js'), 'utf8'), function(err, content) {
				should.not.exist(err);
				content.should.eql('var bar=require("./package/bar"),foo=require("./package/foo");');
				done();
			});
		});
		it('should compress css file contents', function(done) {
			compress('css', fs.readFileSync(path.resolve('main.css'), 'utf8'), function(err, content) {
				should.not.exist(err);
				content.should.eql("@import 'foo';body{background-color:#000}");
				done();
			});
		});
	});

	describe('wrap', function() {
		it('should wrap js file contents in a module definition', function() {
			wrap('main', fs.readFileSync(path.resolve('main.js'), 'utf8'), false).should.eql("require.register(\'main\', function(module, exports, require) {\n  var bar = require(\'./package/bar\')\n  \t, foo = require(\'./package/foo\');\n});");
		});
		it('should wrap js file contents in a lazy module definition', function() {
			wrap('main', fs.readFileSync(path.resolve('main.js'), 'utf8'), true).should.eql("require.register(\'main\', var bar = require(\'./package/bar\')\n\t, foo = require(\'./package/foo\'););");
		});
	});

	describe('parse', function() {
		it('should return an array of js dependency ids', function() {
			parse('js', fs.readFileSync(path.resolve('main.js'), 'utf8')).should.eql(['./package/bar', './package/foo']);
		});
		it('should return an array of css dependency ids', function() {
			parse('css', fs.readFileSync(path.resolve('main.css'), 'utf8')).should.eql(['foo']);
		});
	});
});
