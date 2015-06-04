'use strict';

var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, should = require('should')
	, Builder = require('../lib/builder')
	, config = require('../lib/config');

function gatherFiles (dir, files) {
	files = files || [];
	for (var item in fs.readdirSync(dir)) {
		var p = path.resolve(dir, item);
		if (fs.statSync(p).isFile()) {
			files.push(p);
		} else {
			gatherFiles(p, files);
		}
	}
	return files;
}

describe('Builder', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/builder'));
	});
	beforeEach(function () {
		this.builder = new Builder();
	});
	afterEach(function () {
		this.builder = null;
		rimraf.sync(path.resolve('output'));
	});

	describe('init', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/init'));
		});
		it('should initialize a single target', function () {
			var targets = this.builder.initTargets([{
				inputPath: path.resolve('target/foo.js'),
				input: 'target/foo.js',
				output: 'main.js',
				runtimeOptions: {}
			}]);
			targets.should.have.length(1);
		});
		it('should initialize a single target with nested child target', function () {
			var targets = this.builder.initTargets([{
				inputPath: path.resolve('target/foo.js'),
				input: 'target/foo.js',
				output: 'main.js',
				hasChildren: true,
				runtimeOptions: {},
				targets:[{
					inputPath: path.resolve('target/lib'),
					input:'target/lib',
					output:'../js',
					runtimeOptions: {}
				}]
			}]);
			targets.should.have.length(1);
			targets[0].targets.should.have.length(1);
		});
	});

	describe('build', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/simple'));
		});
		describe('simple file targets', function () {
			it('should build 1 js file when passed a JSON config object', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.js",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("require.register('foo.js', function(module, exports, require) {\n  var foo = this;\n});")
					done();
				});
			});
		});

		describe('directory targets', function () {

		});

		describe('project targets', function () {

		});
	});

});