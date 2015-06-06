'use strict';

var fs = require('fs')
	, path = require('path')
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
		describe('simple file targets', function () {
			before(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/builder/build/simple'));
			});

			it('should build a js file when passed a json config path', function (done) {
				this.builder.build('buddy-single-file.json', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("require.register('foo.js', function(require, module, exports) {\n  var foo = this;\n});")
					done();
				});
			});
			it('should build a js file when passed a js config path', function (done) {
				this.builder.build('buddy-single-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("require.register('foo.js', function(require, module, exports) {\n  var foo = this;\n});")
					done();
				});
			});
			it('should build a js file when passed a json config object', function (done) {
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
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("require.register('foo.js', function(require, module, exports) {\n  var foo = this;\n});")
					done();
				});
			});
			it('should build a js file with 1 dependency', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "bar.js",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("require.register('foo.js', function(require, module, exports) {\n  var foo = this;\n});")
					done();
				});
			});
			it('should build a prewrapped js file', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "wrapped.js",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.readFileSync(filepaths[0], 'utf8').should.containEql("register.require(\'wrapped.js\', function (require, module, exports) {\n\tmodule.exports = \'wrapped\';\n});")
					done();
				});
			});
			it('should build an es6 file', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.es6",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var content = fs.readFileSync(filepaths[0], 'utf8');
					content.should.containEql("nums.map(function (n) {");
					content.should.containEql("return { x: x, y: y };");
					done();
				});
			});
			it('should build a handlebars html file', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.handlebars",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var content = fs.readFileSync(filepaths[0], 'utf8');
					content.should.equal('<div class="entry">\n  <h1></h1>\n  <div class="body">\n    \n  </div>\n</div>');
					done();
				});
			});
			it('should build a stylus file', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.styl",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var content = fs.readFileSync(filepaths[0], 'utf8');
					content.should.endWith('body {\n  color: #fff;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n');
					done();
				});
			});
			it('should build a less file', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.less",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var content = fs.readFileSync(filepaths[0], 'utf8');
					content.should.endWith('header {\n  color: #333333;\n  border-left: 1px;\n  border-right: 2px;\n}\n#footer {\n  color: #114411;\n  border-color: #7d2717;\n}\n');
					done();
				});
			});
			it('should build a js file with unique hashed name', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "foo.js",
								"output": "output/foo-%hash%.js"
							}
						]
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					path.basename(filepaths[0]).should.eql('foo-3a1eaa5569fdf931ca8876b47af65b91.js');
					done();
				});
			});
		});

		describe('directory targets', function () {
			before(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/builder/build/directory'));
			});

			it('should build 3 wrapped js files', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "js/flat",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
						fs.readFileSync(filepath, 'utf8').should.include('require.register(');
					});
					done();
				});
			});
			it('should build 3 unwrapped js files if "modular" is false', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "js/flat",
								"output": "output",
								"modular": false
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
						fs.readFileSync(filepath, 'utf8').should.not.include('require.register(');
					});
					done();
				});
			});
			it('should build 3 wrapped js files, including nested directories', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "js/nested",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
						fs.readFileSync(filepath, 'utf8').should.include('require.register(');
					});
					done();
				});
			});
			it('should build 2 wrapped js files, including dependencies in nested directories', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "js/dependant",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(2);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
						fs.readFileSync(filepath, 'utf8').should.include('require.register(');
					});
					done();
				});
			});
			it('should build 2 css files', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "css",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(2);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
					});
					done();
				});
			});
			it('should build mixed content, including dependencies', function (done) {
				this.builder.build({
					build: {
						"targets": [
							{
								"input": "mixed",
								"output": "output"
							}
						]
					}
				}, null, function (err, filepaths) {
					filepaths.should.have.length(2);
					filepaths.forEach(function (filepath) {
						fs.existsSync(filepath).should.be.true;
						var ext = path.extname(filepath)
							, content = fs.readFileSync(filepath, 'utf8');
						if (ext == '.js') {
							content.should.include("require.register('mixed/bar.js'");
							content.should.include("require.register('mixed/foo.js'");
						} else {
							content.should.include("body {");
							content.should.include("h1 {");
						}
					});
					done();
				});
			});
		});

		describe('project targets', function () {

		});
	});

});