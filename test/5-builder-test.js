'use strict';

var Builder = require('../lib/builder')
	, exec = require('child_process').exec
	, expect = require('expect.js')
	, fs = require('fs')
	, path = require('path')
	, rimraf = require('rimraf');

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
				inputpath: path.resolve('target/foo.js'),
				input: 'target/foo.js',
				output: 'main.js',
				runtimeOptions: {}
			}]);
			expect(targets).to.have.length(1);
		});
		it('should initialize a single target with nested child target', function () {
			var targets = this.builder.initTargets([{
				inputpath: path.resolve('target/foo.js'),
				input: 'target/foo.js',
				output: 'main.js',
				hasChildren: true,
				runtimeOptions: {},
				targets:[{
					inputpath: path.resolve('target/lib'),
					input:'target/lib',
					output:'../js',
					runtimeOptions: {}
				}]
			}]);
			expect(targets).to.have.length(1);
			expect(targets[0].targets).to.have.length(1);
		});
	});

	describe('build', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build'));
		});

		it('should build a js file when passed a json config path', function (done) {
			this.builder.build('buddy-single-file.json', null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("require.register('foo.js', function(require, module, exports) {\n    var foo = this;\n});")
				done();
			});
		});
		it('should build a js file when passed a js config path', function (done) {
			this.builder.build('buddy-single-file.js', null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("require.register('foo.js', function(require, module, exports) {\n    var foo = this;\n});")
				done();
			});
		});
		it('should build a js file when passed a json config object', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("require.register('foo.js', function(require, module, exports) {\n    var foo = this;\n});")
				done();
			});
		});
		it('should build a js file with 1 dependency', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bar.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("require.register('foo.js', function(require, module, exports) {\n    var foo = this;\n});")
				done();
			});
		});
		it('should build a js file with node_modules dependencies', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bat.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('bar/bar.js#0.0.0'");
				expect(content).to.contain("require.register('foo/foo.js#0.0.0'");
				expect(content).to.contain("require.register('bat.js'");
				done();
			});
		});
		it('should build a js file with relative node_modules dependencies', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'boo.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('bar/dist/commonjs/lib/bar.js#0.0.0'");
				expect(content).to.contain("var bar = require('bar/dist/commonjs/lib/bar.js#0.0.0'),");
				done();
			});
		});
		it('should build a js file with json dependency', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bing.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('bing.js'");
				expect(content).to.contain("var json = {\n  \"content\": \"foo\"\n};");
				done();
			});
		});
		it('should build a js file with disabled dependency', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bong.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('bong.js'");
				expect(content).to.contain("var bat = {};");
				done();
			});
		});
		it('should build a js file with disabled native dependency', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'native.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('native.js'");
				expect(content).to.contain("var http = {};");
				done();
			});
		});
		it('should build a prewrapped js file', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'wrapped.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(fs.readFileSync(filepaths[0], 'utf8')).to.contain("register.require(\'wrapped.js\', function (require, module, exports) {\n\tmodule.exports = \'wrapped\';\n});")
				done();
			});
		});
		it('should build an es6 file', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.es6',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("nums.map(function (n) {");
				expect(content).to.contain("return { x: x, y: y };");
				done();
			});
		});
		it('should build a handlebars html file', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.handlebars',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.equal('<div class="entry">\n  <h1></h1>\n  <div class="body">\n    \n  </div>\n</div>');
				done();
			});
		});
		it('should build a dust html file with sidecar data file and includes', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.dust',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.equal('<!DOCTYPE html>\n<html>\n<head>\n\t<title>Title</title>\n</head>\n<body>\n\t<h1>Title</h1>\n\t<footer>\n\t<p>Footer</p>\n\t<div>foo</div>\n</footer>\n</body>\n</html>');
				done();
			});
		});
		it('should build a stylus file', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.styl',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain('body {\n  color: #fff;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n');
				done();
			});
		});
		it('should build a less file', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.less',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain('header {\n  color: #333333;\n  border-left: 1px;\n  border-right: 2px;\n}\n#footer {\n  color: #114411;\n  border-color: #7d2717;\n}\n');
				done();
			});
		});
		it('should build a js file with unique hashed name', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output/foo-%hash%.js'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(path.basename(filepaths[0])).to.eql('foo-0f1d8c291e764ab11cf16a0123a62c9d.js');
				done();
			});
		});
		it('should build an html template file with js dependency', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.nunjs',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("<script>var foo = this;</script>");
				done();
			});
		});
		it('should build a directory of 3 js files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'js-directory/flat',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(3);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.contain('require.register(');
				});
				done();
			});
		});
		it('should build a directory of 3 unwrapped js files if "modular" is false', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'js-directory/flat',
							output: 'output',
							"modular": false
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(3);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.not.contain('require.register(');
				});
				done();
			});
		});
		it('should build a directory of 3 js files, including nested directories', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'js-directory/nested',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(3);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.contain('require.register(');
				});
				done();
			});
		});
		it('should build a directory of 2 js files, including dependencies in nested directories', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'js-directory/dependant',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.contain('require.register(');
				});
				done();
			});
		});
		it('should build a directory of 2 css files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'css-directory',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
				});
				done();
			});
		});
		it('should build multiple css files with shared dependencies', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: ['one.styl', 'two.styl'],
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content1 = fs.readFileSync(filepaths[0], 'utf8')
					, content2 = fs.readFileSync(filepaths[1], 'utf8');
				expect(content1).to.eql(content2);
				expect(content1).to.contain("colour: '#ffffff';");
				expect(content2).to.contain("colour: '#ffffff';");
				done();
			});
		});
		it('should build a directory with mixed content, including dependencies', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'mixed-directory',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					var ext = path.extname(filepath)
						, content = fs.readFileSync(filepath, 'utf8');
					if (ext == '.js') {
						expect(content).to.contain("require.register('mixed-directory/bar.js'");
						expect(content).to.contain("require.register('mixed-directory/foo.js'");
					} else {
						expect(content).to.contain("body {");
						expect(content).to.contain("h1 {");
					}
				});
				done();
			});
		});
		it('should build a globbed collection of js files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'js-directory/flat/{foo,bar}.js',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.contain('require.register(');
				});
				done();
			});
		});
		it('should build a globbed collection of mixed files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'mixed-directory/foo.{js,styl}',
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					var ext = path.extname(filepath)
						, content = fs.readFileSync(filepath, 'utf8');
					if (ext == '.js') {
						expect(content).to.contain("require.register('mixed-directory/bar.js'");
						expect(content).to.contain("require.register('mixed-directory/foo.js'");
					} else {
						expect(content).to.contain("body {");
						expect(content).to.contain("h1 {");
					}
				});
				done();
			});
		});
		it('should build an array of js files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: ['js-directory/flat/foo.js', 'js-directory/nested/bar.js'],
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					expect(fs.readFileSync(filepath, 'utf8')).to.contain('require.register(');
				});
				done();
			});
		});
		it('should build an array of mixed files', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: ['mixed-directory/foo.js', 'mixed-directory/foo.styl'],
							output: 'output'
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				filepaths.forEach(function (filepath) {
					expect(fs.existsSync(filepath)).to.be(true);
					var ext = path.extname(filepath)
						, content = fs.readFileSync(filepath, 'utf8');
					if (ext == '.js') {
						expect(content).to.contain("require.register('mixed-directory/bar.js'");
						expect(content).to.contain("require.register('mixed-directory/foo.js'");
					} else {
						expect(content).to.contain("body {");
						expect(content).to.contain("h1 {");
					}
				});
				done();
			});
		});
		it('should build a stringified js file if "lazy" is true', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output'
						}
					]
				}
			}, { lazy: true }, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('foo.js', \"var foo = this;\");");
				done();
			});
		});
		it('should build a minified js file if "compress" is true', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bar.js',
							output: 'output'
						}
					]
				}
			}, { compress: true }, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain('require.register("foo.js",function(r,e,i){}),require.register("bar.js",function(r,e,i){r("foo.js")});');
				done();
			});
		});
		it('should build a minified and stringified js file if "compress" and "lazy" are true', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'bar.js',
							output: 'output'
						}
					]
				}
			}, { compress: true, lazy: true }, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain('require.register("foo.js","var foo=this;"),require.register("bar.js",\'var foo=require("foo.js"),bar=this;\');');
				done();
			});
		});
		it('should build a js file with require boilerplate if "boilerplate" is true', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output',
							boilerplate: true
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("})((typeof window !== 'undefined') ? window : global);");
				expect(content).to.contain("require.register('foo.js'");
				done();
			});
		});
		it('should build a bootstrapped js file if "bootstrap" is true', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output',
							bootstrap: true
						}
					]
				}
			}, null, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				var content = fs.readFileSync(filepaths[0], 'utf8');
				expect(content).to.contain("require.register('foo.js'");
				expect(content).to.contain("require('foo.js');");
				done();
			});
		});
	});

	describe('script', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/script'));
		});

		it('should run a script after successful build', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output'
						}
					]
				},
				script: 'node mod.js output/foo.js'
			}, { script: true }, function (err, filepaths) {
				setTimeout(function () {
					expect(fs.existsSync(filepaths[0])).to.be(true);
					var content = fs.readFileSync(filepaths[0], 'utf8');
					expect(content).to.eql("oops!");
					done();
				}, 100);
			});
		});
	});

	describe('grep', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/grep'));
		});

		it('should only build matching targets', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output'
						},
						{
							input: 'foo.css',
							output: 'output'
						}
					]
				}
			}, { grep: '*.js' }, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(filepaths[0]).to.eql(path.resolve('output/foo.js'));
				done();
			});
		});
		it('should only build matching targets when globbing input', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: '*.js',
							output: 'output'
						},
						{
							input: 'foo.css',
							output: 'output'
						}
					]
				}
			}, { grep: 'foo.*' }, function (err, filepaths) {
				expect(filepaths).to.have.length(2);
				expect(filepaths[0]).to.match(/foo\./);
				expect(filepaths[1]).to.match(/foo\./);
				done();
			});
		});
		it('should only build matching targets when using "--invert" option', function (done) {
			this.builder.build({
				build: {
					targets: [
						{
							input: 'foo.js',
							output: 'output'
						},
						{
							input: 'foo.css',
							output: 'output'
						}
					]
				}
			}, { grep: '*.js', invert: true }, function (err, filepaths) {
				expect(filepaths).to.have.length(1);
				expect(fs.existsSync(filepaths[0])).to.be(true);
				expect(filepaths[0]).to.eql(path.resolve('output/foo.css'));
				done();
			});
		});
	});

	describe('watch', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/watch'));
		});

		it('should rebuild a watched file on change', function (done) {
			var child = exec('NODE_ENV=dev && ../../../../bin/buddy watch buddy-watch-file.js', {}, function (err, stdout, stderr) {
						console.log(arguments);
						done(err);
					})
				, foo = fs.readFileSync(path.resolve('foo.js'), 'utf8');

			setTimeout(function () {
				fs.writeFileSync(path.resolve('foo.js'), 'var foo = "foo";', 'utf8');
				setTimeout(function () {
					var content = fs.readFileSync(path.resolve('output/foo.js'), 'utf8');
					expect(content).to.contain("require.register(\'foo.js\', function(require, module, exports) {\n    var foo = \"foo\";\n});");
					fs.writeFileSync(path.resolve('foo.js'), foo);
					child.kill();
					done();
				}, 100);
			}, 4000);
		});
	});
});