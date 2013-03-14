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
			it('should return an error', function(done) {
				configuration.locate(null, function(err, url) {
					should.exist(err);
					done();
				});
			});
		});
	});

	describe('load', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
		});
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
