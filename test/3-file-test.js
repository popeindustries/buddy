var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, fileFactory = require('../lib/file')
	, identifyResource = require('identify-resource')

	, fileExtensions = {
			js: ['js', 'json'],
			css: ['css'],
			html: ['html', 'dust']
		};

describe('file', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/file'));
	});
	beforeEach(function () {
		fileFactory.cache.flush();
		identifyResource.clearCache();
	});

	describe('factory', function () {
		it('should decorate a new File instance with passed data', function () {
			var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
			instance.should.have.property('type', 'js');
		});
		it('should resolve a module id for a File instance', function () {
			var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
			instance.should.have.property('id', 'src/main.js');
		});
		it('should resolve a module id for an "index" File instance', function () {
			var instance = fileFactory(path.resolve('src/index.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
			instance.should.have.property('id', 'src/index.js');
		});
		it('should resolve a module id for a node_module "index" File instance ', function () {
			var instance = fileFactory(path.resolve('node_modules/foo/index.js'), { sources: [], fileExtensions: fileExtensions });
			instance.should.have.property('id', 'foo/index.js');
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function () {
			var instance = fileFactory(path.resolve('node_modules/bar/bar.js'), { sources: [], fileExtensions: fileExtensions });
			instance.should.have.property('id', 'bar/bar.js#1.0.0');
		});
	});

	describe('workflow', function () {
		describe('load()', function () {
			it('should load and store js file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.load(function (err) {
					instance.content.should.eql(instance.fileContent);
					instance.content.should.eql("'use strict';\n\nmodule.exports = 'main';\n");
					done();
				});
			});
		});

		describe('wrap()', function () {
			it('should wrap js file contents in a module definition', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.id = 'main';
				instance.content = "module.exports = 'main';";
				instance.wrap(function (err) {
					instance.content.should.eql("require.register('main', function(require, module, exports) {\n  module.exports = 'main';\n});");
					done();
				});
			});
			it('should wrap js file contents in a lazy module definition', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions, runtimeOptions:{lazy:true} });
				instance.id = 'main';
				instance.content = "module.exports = 'main';";
				instance.wrap(function (err) {
					instance.content.should.eql("require.register(\'main\', module.exports = \'main\';);");
					done();
				});
			});
		});

		describe('escape()', function () {
			it('should transform js file contents into an escaped string', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "module.exports = 'main';";
				instance.escape(function (err) {
					instance.content.should.eql('"module.exports = \'main\';"');
					done();
				});
			});
		});

		describe('lint()', function () {
			it('should skip compileable files', function (done) {
				var instance = fileFactory(path.resolve('src/main.coffee'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.not.exist(warnings);
				done();
			});
			it('should not return lint errors for well written js content configured with .eslintrc file', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.not.exist(warnings);
				done();
			});
			it('should return lint errors for badly written js content', function (done) {
				var instance = fileFactory(path.resolve('src/main-bad.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.exist(warnings);
				done();
			});
			it('should return lint errors for badly written css content', function (done) {
				var instance = fileFactory(path.resolve('src/main-bad.css'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.exist(warnings);
				done();
			});
		});

		describe('compress()', function () {
			it('should compress js file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "var foo = 'foo';\nmodule.exports = 'main';";
				instance.compress(function (err) {
					instance.content.should.eql('var foo="foo";module.exports="main";');
					done()
				});
			});
			it('should compress css file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.css'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "body {\n	background-color: black;\n}"
				instance.compress(function (err) {
					instance.content.should.eql("body{background-color:#000}");
					done()
				});
			});
		});

		describe('parse()', function () {
			it('should store an array of js dependencies', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: fileExtensions }
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, bar = fileFactory(path.resolve('src/bar.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar bar = require('./bar');";
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.eql(dependencies);
					instance.dependencies.should.have.length(2);
					done();
				});
			});
			it('should store an array of css dependency objects', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: fileExtensions }
					, foo = fileFactory(path.resolve('src/foo.css'), options)
					, instance = fileFactory(path.resolve('src/main.css'), options);
				instance.content = "@import 'foo'";
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.have.length(1);
					done();
				});
			});
			it('should store an array of html dependency objects', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] } }
					, foo = fileFactory(path.resolve('src/foo.dust'), options)
					, instance = fileFactory(path.resolve('src/main.dust'), options);
				instance.content = "{>foo /}";
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.have.length(1);
					done();
				});
			});
			it('should store an array of html "inline" dependency objects', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: { html: ['html', 'dust'] } }
					, instance = fileFactory(path.resolve('src/main.dust'), options);
				instance.content = '<script inline src="src/foo.js"></script>';
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.have.length(1);
					done();
				});
			});
			it('should only store 1 dependency object when there are duplicates', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: fileExtensions }
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar foo = require('./foo');";
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.have.length(1);
					done();
				});
			});
			it('should store 2 dependency objects when there are case sensitive package references', function (done) {
				var options = { sources: [path.resolve('src')], fileExtensions: fileExtensions }
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var bat = require('bar');\nvar boo = require('Boo');"
				instance.parse(function (err, dependencies) {
					instance.dependencies.should.have.length(2);
					done();
				});
			});
		});

		describe('replaceReferences()', function () {
			it('should replace relative ids with absolute ones', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "var foo = require('./foo');";
				instance.dependencyReferences = [
					{
						filepath:'./foo',
						match: "require('./foo')",
						instance: {id:'foo'}
					}
				];
				instance.replaceReferences(function (err) {
					instance.content.should.eql("var foo = require('foo');");
					done();
				});
			});
			it('should replace relative html include paths with absolute ones', function (done) {
				var instance = fileFactory(path.resolve('src/main.dust'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "{>foo /}";
				instance.dependencyReferences = [
					{
						filepath:'foo',
						match: "{>foo ",
						instance: {filepath:path.resolve('src/foo.dust')}
					}
				];
				instance.replaceReferences(function (err) {
					instance.content.should.eql('{>' + path.resolve('src/foo.dust') + ' /}');
					done();
				});
			});
			it('should replace relative html inline paths with absolute ones', function (done) {
				var instance = fileFactory(path.resolve('src/main.dust'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = '<script inline src="./main.js"></script>';
				instance.dependencyReferences = [
					{
						filepath:'main.js',
						match: '<script inline src="./main.js"></script>',
						stack: [],
						instance: {filepath:path.resolve('src/main.js')}
					}
				];
				instance.replaceReferences(function (err) {
					instance.dependencyReferences[0].filepath.should.eql(path.resolve('src/main.js'));
					done();
				});
			});
			it('should replace package ids with versioned ones', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "var bar = require('bar');\nvar baz = require('view/baz');";
				instance.dependencyReferences = [
					{
						filepath:'bar',
						match: "require('bar')",
						instance: {id:'bar@0'}
					},
					{
						filepath:'view/baz',
						match: "require('view/baz')",
						instance: {id: 'view/baz'}
					}
				];
				instance.replaceReferences(function (err) {
					instance.content.should.eql("var bar = require('bar@0');\nvar baz = require('view/baz');");
					done();
				});
			});
		});

		describe('replaceEnvironment()', function () {
			it('should inline calls to process.env', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "process.env.NODE_ENV process.env['NODE_ENV'] process.env[\"NODE_ENV\"]";
				instance.replaceEnvironment(function (err) {
					instance.content.should.eql("'test' 'test' 'test'");
					done()
				});
			});
			it('should handle undefined values when inlining calls to process.env', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "process.env.FEATURE_FOO";
				instance.replaceEnvironment(function (err) {
					instance.content.should.eql("undefined");
					done()
				});
			});
		});

		describe('inline()', function () {
			it('should inline require(*.json) content', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "var foo = require('./foo.json');";
				instance.dependencyReferences = [
					{
						instance: {
							filepath: path.resolve('./src/foo.json'),
						},
						filepath: './foo.json',
						match: "require('./foo.json')"
					}
				];
				instance.inline(function (err) {
					instance.content.should.eql('var foo = {\"foo\":\"bar\"};');
					done()
				});
			});
			it('should inline an empty object when unable to locate require(*.json) content', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "var foo = require('./bar.json');";
				instance.dependencyReferences = [
					{
						instance: {
							filepath: path.resolve('./src/bar.json'),
						},
						filepath: './bar.json',
						match: "require('./bar.json')"
					}
				];
				instance.inline(function (err) {
					instance.content.should.eql('var foo = {};');
					done()
				});
			});
			it('should replace css @import rules with file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.css'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "@import 'foo'\nbody {\n\tbackground-color: black;\n}";
				instance.dependencyReferences = [
					{
						filepath:'foo',
						match: "@import 'foo'",
						instance: {
							dependencyReferences: [],
							content: 'div {\n\twidth: 50%;\n}\n'
						}
					}
				];
				instance.inline(function (err) {
					instance.content.should.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
					done()
				});
			});
			it('should replace css @import rules with file contents, allowing duplicates', function (done) {
				var instance = fileFactory(path.resolve('src/main.css'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.content = "@import 'foo'\n@import 'foo'";
				instance.dependencyReferences = [
					{
						filepath:'foo',
						match: "@import 'foo'",
						instance: {
							dependencyReferences: [],
							content: 'div {\n\twidth: 50%;\n}\n'
						}
					}
				];
				instance.inline(function (err) {
					instance.content.should.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
					done()
				});
			});
		});

		describe('run()', function () {
			it('should execute a workflow in sequence', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.run(['load', 'wrap'], function () {
					instance.content.should.eql("require.register(\'src/main.js\', function(require, module, exports) {\n  \'use strict\';\n  \n  module.exports = \'main\';\n  \n});");
					done();
				});
			});
			it('should return several files when parsing dependencies', function (done) {
				var instance = fileFactory(path.resolve('src/bar.js'), { sources: [path.resolve('src')], fileExtensions: fileExtensions });
				instance.run(['load', 'parse'], function (err, dependencies) {
					dependencies.should.have.length(1);
					instance.content.should.eql("var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';");
					done();
				});
			});
		});
	});
});
