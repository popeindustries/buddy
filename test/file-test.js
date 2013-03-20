var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, fileFactory = require('../lib/core/file');

describe.only('file', function() {
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
			fileFactory(path.resolve('node_modules/bar/bar.js'), {type:'js', sources:[path.resolve('node_modules')]}, function(err, instance) {
				instance.should.have.property('id', 'bar');
			});
		});
	});

	describe('transfigure', function() {
		it('should store compiled and original content', function(done) {
			fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.transfigure(function(err) {
					instance.should.have.property('_content', "Class = require('./package/class')\nClassCamelCase = require('./package/classcamelcase')\n\ninstance = new Class\n");
					instance.should.have.property('_transContent', "var Class, ClassCamelCase, instance;\n\nClass = require('./package/class');\n\nClassCamelCase = require('./package/classcamelcase');\n\ninstance = new Class;\n");
					done();
				});
			});
		});
	});

	describe('resolve', function() {
	});
});
