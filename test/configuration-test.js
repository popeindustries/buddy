var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, configuration = require('../lib/core/configuration');

describe('configuration', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
	});

	describe('locate', function() {
		describe('from a valid working directory', function() {
			it('should return a path to the default js file when no name is specified', function(done) {
				configuration.locate(null, function(err, url) {
					url.should.equal(path.resolve('buddy.js'));
					done();
				});
			});
			it('should return a path to the named file when a name is specified', function(done) {
				configuration.locate('buddy_custom_name.js', function(err, url) {
					url.should.equal(path.resolve('buddy_custom_name.js'));
					done();
				});
			});
			it('should return a path to the default file in the specified directory when a directory name is specified', function(done) {
				configuration.locate('nested', function(err, url) {
					url.should.equal(path.resolve('nested', 'buddy.js'));
					done();
				});
			});
			it('should return a path to the default json file in the specified directory when a directory name is specified', function(done) {
				configuration.locate('json', function(err, url) {
					url.should.equal(path.resolve('json', 'buddy.json'));
					done();
				});
			});
			it('should return a path to the default package.json file in the specified directory when a directory name is specified', function(done) {
				configuration.locate('pkgjson', function(err, url) {
					url.should.equal(path.resolve('pkgjson', 'package.json'));
					done();
				});
			});
			it('should return a path to the named file in the specified directory when a directory and name are specified', function(done) {
				configuration.locate('nested/buddy_custom_name.js', function(err, url) {
					url.should.equal(path.resolve('nested', 'buddy_custom_name.js'));
					done();
				});
			});
			it('should return an error when an invalid name is specified', function(done) {
				configuration.locate('buddy_no_name.js', function(err, url) {
					should.exist(err);
					done();
				});
			});
		});
		describe('from a valid child working directory', function() {
			before(function() {
				process.chdir(path.resolve('nested'));
			});
			after(function() {
				process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
			});
			it('should return a path to the default file in a parent of the cwd when no name is specified', function(done) {
				configuration.locate(null, function(err, url) {
					url.should.equal(path.resolve('buddy.js'));
					done();
				});
			});
		});
		describe('from an invalid working directory', function() {
			before(function() {
				process.chdir('/');
			});
			after(function() {
				process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
			});
			it('should return an error', function(done) {
				configuration.locate(null, function(err, url) {
					should.exist(err);
					done();
				});
			});
		});
	});

	describe('parse', function() {
		it('should return null when passed build data missing "targets"', function() {
			should.not.exist(configuration.parse({js:{sources:['src']}}, {compress:false}));
		});
		it('should return null when passed build data with no "targets"', function() {
			should.not.exist(configuration.parse({js:{sources:['src'],targets:[]}}, {compress:false}));
		});
		it('should return null when passed build data "input" that doesn\'t exist', function() {
			should.not.exist(configuration.parse({js:{sources:['src'],targets:[{input:'src/hey.js',output:'js'}]}}, {compress:false}));
		});
		it('should return null when passed build data with directory "input" and a file "output"', function() {
			should.not.exist(configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js/main.js'}]}}, {compress:false}));
		});
		it('should return an object when passed valid build data', function() {
			should.exist(configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js/main.js'}]}}, {compress:false}));
		});
		it('should return an object excluding invalid "targets"', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js/main.js'},{input:'src/hey.js',output:'js'}]}}, {compress:false}).targets.should.have.length(1);
		});
		it('should return an object including valid child "targets"', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js/main.js',targets:[{input:'src/sub.js',output:'js'}]}]}}, {compress:false}).targets[0].targets.should.have.length(1);
		});
		it('should return an object with resolved "inputPath" and "outputPath" properties', function() {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false});
			data.targets[0].inputPath.should.include('buddy/test/fixtures/configuration/src');
			data.targets[0].outputPath.should.include('buddy/test/fixtures/configuration/js');
		});
		it('should return an object with resolved "outputPath" when "input" is file and "output" is directory', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false}).targets[0].outputPath.should.include('main.js');
		});
		it('should return an object with "isDir" set to TRUE when "input" is a directory', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].isDir.should.be.ok;
		});
		it('should return an object with "modular" defaulted to TRUE for js and css targets', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].modular.should.be.ok;
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js',modular:false}]}}, {compress:false}).targets[0].modular.should.not.be.ok;
		});
		it('should return an object with the correct processing workflow set for an html target', function() {
			configuration.parse({html:{sources:['src'],targets:[{input:'src',output:'html'}]}}, {compress:false}).targets[0].workflow.should.eql(['compile', 'target:output']);
		});
		it('should return an object with the correct processing workflow set for a css target', function() {
			configuration.parse({css:{sources:['src'],targets:[{input:'src',output:'css'}]}}, {compress:false}).targets[0].workflow.should.eql(['parse', 'concat', 'target:filter', 'compile', 'target:output']);
		});
		it('should return an object with the correct processing workflow set for a js directory target', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].workflow.should.eql(['compile', 'wrap', 'target:output']);
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js',modular:false}]}}, {compress:false}).targets[0].workflow.should.eql(['compile', 'target:output']);
		});
		it('should return an object with the correct processing workflow set for a js file target', function() {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false}).targets[0].workflow.should.eql(['compile', 'parse', 'wrap', 'target:resolve', 'concat', 'target:filter', 'target:output']);
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js',modular:false}]}}, {compress:false}).targets[0].workflow.should.eql(['compile', 'target:output']);
		});
	});

	describe('load', function() {
		it('should return validated file data', function(done) {
			configuration.load('buddy.js', function(err, config) {
				should.exist(config.build);
				done();
			});
		});
		it('should return validated file data for a package.json config file', function(done) {
			configuration.load('package.json', function(err, config) {
				should.exist(config.build);
				done();
			});
		});
		it('should return an error when passed a reference to a malformed file', function(done) {
			configuration.load('buddy_bad.js', function(err, config) {
				should.exist(err);
				done();
			});
		});
	});
});
