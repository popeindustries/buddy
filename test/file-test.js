var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, fileFactory = require('../lib/core/file')
	, compress = require('../lib/core/file/compress')
	, escape = require('../lib/core/file/escape')
	, parse = require('../lib/core/file/parse')
	, wrap = require('../lib/core/file/wrap');

describe('file', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/file'));
	});
	describe('factory', function() {
		it('should decorate a new File instance with passed data', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('type', 'js');
			});
		});
		it('should resolve a module id for a File instance', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('id', 'main');
			});
		});
		it('should resolve a module id for an "index" File instance', function() {
			fileFactory(path.resolve('src/index.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('id', 'src');
			});
		});
		it('should resolve a module id for a node_module "index" File instance ', function() {
			fileFactory(path.resolve('node_modules/foo/index.js'), {type:'js', sources:[path.resolve('node_modules')]}, function(err, instance) {
				instance.should.have.property('id', 'foo');
			});
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function() {
			fileFactory(path.resolve('node_modules/bar/lib/bar.js'), {type:'js', sources:[path.resolve('node_modules')]}, function(err, instance) {
				instance.should.have.property('id', 'bar');
			});
		});
	});

	describe('escape', function() {
		it('should transform js file contents into an escaped string', function() {
			escape({content: fs.readFileSync(path.resolve('src/main.js'), 'utf8')}, null, function(err, file) {
				file.content.should.eql("\"var bar = require('./package/bar')\\n\t, foo = require('./package/foo');\"");
			});
		});
	});

	describe('compress', function() {
		it('should compress js file contents', function(done) {
			compress({type:'js', content: fs.readFileSync(path.resolve('src/main.js'), 'utf8')}, null, function(err, file) {
				should.not.exist(err);
				file.content.should.eql('var bar=require("./package/bar"),foo=require("./package/foo");');
				done();
			});
		});
		it('should compress css file contents', function(done) {
			compress({type:'css', content:fs.readFileSync(path.resolve('src/main.css'), 'utf8')}, null, function(err, file) {
				should.not.exist(err);
				file.content.should.eql("@import 'foo';body{background-color:#000}");
				done();
			});
		});
	});

	describe('wrap', function() {
		it('should wrap js file contents in a module definition', function() {
			wrap({id:'main', content: fs.readFileSync(path.resolve('src/main.js'), 'utf8')}, {lazy:false}, function(err, file) {
				file.content.should.eql("require.register(\'main\', function(module, exports, require) {\n  var bar = require(\'./package/bar\')\n  \t, foo = require(\'./package/foo\');\n});");
			});
		});
		it('should wrap js file contents in a lazy module definition', function() {
			wrap({id:'main', content:fs.readFileSync(path.resolve('src/main.js'), 'utf8')}, {lazy:true}, function(err, file) {
				file.content.should.eql("require.register(\'main\', var bar = require(\'./package/bar\')\n\t, foo = require(\'./package/foo\'););");
			});
		});
	});

	describe('parse', function() {
		it('should return an array of js dependency ids', function() {
			parse({type:'js', content: fs.readFileSync(path.resolve('src/main.js'), 'utf8')}, null, function(err, file) {
				file.dependencies.should.eql(['./package/bar', './package/foo']);
			});
		});
		it('should return an array of coffee dependency ids', function() {
			parse({type:'js', content: fs.readFileSync(path.resolve('src/main.coffee'), 'utf8')}, null, function(err, file) {
				file.dependencies.should.eql(['./package/class', './package/classcamelcase']);
			});
		});
		it('should return an array of css dependency ids', function() {
			parse({type:'css', content:fs.readFileSync(path.resolve('src/main.css'), 'utf8')}, null, function(err, file) {
				file.dependencies.should.eql(['foo']);
			});
		});
	});

	// describe('transfigure', function() {
	// 	it('should store compiled and original content', function(done) {
	// 		fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
	// 			instance.transfigure(function(err) {
	// 				instance.should.have.property('_content', "Class = require('./package/class')\nClassCamelCase = require('./package/classcamelcase')\n\ninstance = new Class\n");
	// 				instance.should.have.property('_transContent', "var Class, ClassCamelCase, instance;\n\nClass = require('./package/class');\n\nClassCamelCase = require('./package/classcamelcase');\n\ninstance = new Class;\n");
	// 				done();
	// 			});
	// 		});
	// 	});
	// });

	// describe('resolve', function() {
	// 	it('should generate and store dependency File instances', function(done) {
	// 		fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
	// 			instance._transContent = fs.readFileSync(path.resolve('src/main.js'), 'utf8');
	// 			instance.resolve(function(err) {
	// 				instance.dependencies.should.have.length(2);
	// 				done();
	// 			});
	// 		});
	// 	});
	// });
});
