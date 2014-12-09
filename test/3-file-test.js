var path = require('path')
	, fs = require('fs')
	, co = require('co')
	, should = require('should')
	, fileFactory = require('../lib/core/file')
	, identifyResource = require('identify-resource')

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
			var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
			instance.should.have.property('type', 'js');
		});
		it('should resolve a module id for a File instance', function () {
			var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
			instance.should.have.property('id', 'main');
		});
		it('should resolve a module id for an "index" File instance', function () {
			var instance = fileFactory(path.resolve('src/index.js'), {type:'js', sources:[path.resolve('src')]});
			instance.should.have.property('id', 'src');
		});
		it('should resolve a module id for a node_module "index" File instance ', function () {
			var instance = fileFactory(path.resolve('node_modules/foo/index.js'), {type:'js', sources:[]});
			instance.should.have.property('id', 'foo@0.0.0');
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function () {
			var instance = fileFactory(path.resolve('node_modules/bar/bar.js'), {type:'js', sources:[]});
			instance.should.have.property('id', 'bar@1.0.0');
		});
	});

	describe('workflow', function () {
		describe('load()', function () {
			it('should load and store js file contents', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.load();
				instance.content.should.eql(instance.originalContent);
				instance.content.should.eql("module.exports = 'main';\n");
			});
		});

		describe('wrap()', function () {
			it('should wrap js file contents in a module definition', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.id = 'main';
				instance.content = "module.exports = 'main';";
				instance.wrap();
				instance.content.should.eql("require.register('main', function(module, exports, require) {\n  module.exports = 'main';\n});");
			});
			it('should wrap js file contents in a lazy module definition', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:true}});
				instance.id = 'main';
				instance.content = "module.exports = 'main';";
				instance.wrap();
				instance.content.should.eql("require.register(\'main\', module.exports = \'main\';);");
			});
		});

		describe('escape()', function () {
			it('should transform js file contents into an escaped string', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "module.exports = 'main';";
				instance.escape();
				instance.content.should.eql('"module.exports = \'main\';"');
			});
		});

		describe('lint()', function () {
			it('should skip compileable files', function () {
				var instance = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.not.exist(warnings);
			});
			it('should not return lint errors for well written js content configured with .eslintrc file', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint()
				should.not.exist(warnings);
			});
			it('should return lint errors for badly written js content', function () {
				var instance = fileFactory(path.resolve('src/main-bad.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.exist(warnings);
			});
			it('should return lint errors for badly written css content', function () {
				var instance = fileFactory(path.resolve('src/main-bad.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				var warnings = instance.lint();
				should.exist(warnings);
			});
		});

		describe('compress()', function () {
			it('should compress js file contents', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = 'foo';\nmodule.exports = 'main';";
				instance.compress();
				instance.content.should.eql('var foo="foo";module.exports="main";');
			});
			it('should compress css file contents', function () {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = "body {\n	background-color: black;\n}"
				instance.compress();
				instance.content.should.eql("body{background-color:#000}");
			});
		});

		describe('parse()', function () {
			it('should store an array of js dependencies', function () {
				var options = {type:'js', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, bar = fileFactory(path.resolve('src/bar.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar bar = require('./bar');"
				var dependencies = instance.parse()
				instance.dependencies.should.eql(dependencies);
				instance.dependencies.should.have.length(2);
			});
			it('should store an array of css dependency objects', function () {
				var options = {type:'css', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.css'), options)
					, instance = fileFactory(path.resolve('src/main.css'), options);
				instance.content = "@import 'foo'"
				instance.parse();
				instance.dependencies.should.have.length(1);
			});
			it('should store an array of html dependency objects', function () {
				var options = {type:'html', sources:[path.resolve('src')], fileExtensions:[ 'html', 'dust']}
					, foo = fileFactory(path.resolve('src/foo.dust'), options)
					, instance = fileFactory(path.resolve('src/main.dust'), options);
				instance.content = "{>foo /}"
				instance.parse();
				instance.dependencies.should.have.length(1);
			});
			it('should store an array of html "inline" dependency objects', function () {
				var options = {type:'html', sources:[path.resolve('src')], fileExtensions:[ 'html', 'dust']}
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, instance = fileFactory(path.resolve('src/main.dust'), options);
				instance.content = '<script inline src="foo.js"></script>';
				instance.parse();
				instance.dependencies.should.have.length(1);
			});
			it('should only store 1 dependency object when there are duplicates', function () {
				var options = {type:'js', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar foo = require('./foo');"
				instance.parse();
				instance.dependencies.should.have.length(1);
			});
			it('should store 2 dependency objects when there are case sensitive package references', function () {
				var options = {type:'js', sources:[path.resolve('src')]}
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var bat = require('bar');\nvar boo = require('Boo');"
				instance.parse();
				instance.dependencies.should.have.length(2);
			});
		});

		describe('replaceReferences()', function () {
			it('should replace relative ids with absolute ones', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = require('./foo');";
				instance.dependencyReferences = [
					{
						filepath:'./foo',
						context: "require('./foo')",
						instance: {id:'foo'}
					}
				];
				instance.replaceReferences();
				instance.content.should.eql("var foo = require('foo');");
			});
			it('should replace package ids with versioned ones', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var bar = require('bar');\nvar baz = require('view/baz');";
				instance.dependencyReferences = [
					{
						filepath:'bar',
						context: "require('bar')",
						instance: {id:'bar@0'}
					},
					{
						filepath:'view/baz',
						context: "require('view/baz')",
						instance: {id: 'view/baz'}
					}
				];
				instance.replaceReferences();
				instance.content.should.eql("var bar = require('bar@0');\nvar baz = require('view/baz');");
			});
		});

		describe('replaceEnvironment()', function () {
			it('should inline calls to process.env', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "process.env.NODE_ENV process.env['NODE_ENV'] process.env[\"NODE_ENV\"]";
				instance.replaceEnvironment()
				instance.content.should.eql("'test' 'test' 'test'");
			});
			it('should handle undefined values when inlining calls to process.env', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "process.env.FEATURE_FOO";
				instance.replaceEnvironment()
				instance.content.should.eql("undefined");
			});
		});

		describe('inline()', function () {
			it('should inline require(*.json) content', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = require('./foo.json');";
				instance.dependencyReferences = [
					{
						instance: {
							filepath: path.resolve('./src/foo.json'),
						},
						filepath: './foo.json',
						context: "require('./foo.json')"
					}
				];
				instance.inline()
				instance.content.should.eql('var foo = {\"foo\":\"bar\"};');
			});
			it('should inline an empty object when unable to locate require(*.json) content', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = require('./bar.json');";
				instance.dependencyReferences = [
					{
						instance: {
							filepath: path.resolve('./src/bar.json'),
						},
						filepath: './bar.json',
						context: "require('./bar.json')"
					}
				];
				instance.inline()
				instance.content.should.eql('var foo = {};');
			});
			it('should replace css @import rules with file contents', function () {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = "@import 'foo'\nbody {\n\tbackground-color: black;\n}";
				instance.dependencyReferences = [
					{
						filepath:'foo',
						context: "@import 'foo'",
						instance: {
							dependencyReferences: [],
							content: 'div {\n\twidth: 50%;\n}\n'
						}
					}
				];
				instance.inline()
				instance.content.should.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
			});
			it('should replace css @import rules with file contents, allowing duplicates', function () {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = "@import 'foo'\n@import 'foo'";
				instance.dependencyReferences = [
					{
						filepath:'foo',
						context: "@import 'foo'",
						instance: {
							dependencyReferences: [],
							content: 'div {\n\twidth: 50%;\n}\n'
						}
					}
				];
				instance.inline()
				instance.content.should.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
			});
		});

		describe('run()', function () {
			it('should execute a workflow in sequence', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.run(['load', 'wrap'], function () {
					instance.content.should.eql("require.register('main', function(module, exports, require) {\n  module.exports = 'main';\n  \n});");
					done();
				});
			});
			it('should return several files when parsing dependencies', function (done) {
				var instance = fileFactory(path.resolve('src/bar.js'), {type:'js', sources:[path.resolve('src')]});
				instance.run(['load', 'parse'], function (err, dependencies) {
					dependencies.should.have.length(1);
					instance.content.should.eql("var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';");
					done();
				});
			});
		});
	});
});
