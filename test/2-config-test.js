'use strict';

var config = require('../lib/config')
	, fs = require('fs')
	, path = require('path')
	, should = require('should');

describe('config', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/config'));
	});

	describe('locate', function () {
		describe('from a valid working directory', function () {
			it('should return a path to the default js file when no name is specified', function () {
				config.locate().toLowerCase().should.equal(path.resolve('buddy.js').toLowerCase());
			});
			it('should return a path to the named file when a name is specified', function () {
				config.locate('buddy_custom_name.js').toLowerCase().should.equal(path.resolve('buddy_custom_name.js').toLowerCase());
			});
			it('should return a path to the default file in the specified directory when a directory name is specified', function () {
				config.locate('nested').toLowerCase().should.equal(path.resolve('nested', 'buddy.js').toLowerCase());
			});
			it('should return a path to the default json file in the specified directory when a directory name is specified', function () {
				config.locate('json').toLowerCase().should.equal(path.resolve('json', 'buddy.json').toLowerCase());
			});
			it('should return a path to the default package.json file in the specified directory when a directory name is specified', function () {
				config.locate('pkgjson').toLowerCase().should.equal(path.resolve('pkgjson', 'package.json').toLowerCase());
			});
			it('should return a path to the named file in the specified directory when a directory and name are specified', function () {
				config.locate('nested/buddy_custom_name.js').toLowerCase().should.equal(path.resolve('nested', 'buddy_custom_name.js').toLowerCase());
			});
			it('should throw an error when an invalid name is specified', function () {
				try {
					config.locate('buddy_no_name.js')
				} catch (err) {
					should.exist(err);
				}
			});
		});

		describe('from a valid child working directory', function () {
			before(function () {
				process.chdir(path.resolve('src'));
			});
			after(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/config'));
			});
			it('should return a path to the default file in a parent of the cwd when no name is specified', function () {
				config.locate().toLowerCase().should.equal(path.resolve('../buddy.js').toLowerCase());
			});
		});

		describe('from an invalid working directory', function () {
			before(function () {
				process.chdir('/');
			});
			after(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/config'));
			});
			it('should return an error', function () {
				try {
					config.locate()
				} catch (err) {
					should.exist(err);
				}
			});
		});
	});
});