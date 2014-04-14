var path = require('path')
	, fs = require('fs')
	, co = require('co')
	, should = require('should')
	, fileFactory = require('../lib/core/file')

describe('file', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/file'));
	});
	beforeEach(function () {
		fileFactory.cache.flush();
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
			instance.should.have.property('id', 'foo@0');
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function () {
			var instance = fileFactory(path.resolve('node_modules/bar/bar.js'), {type:'js', sources:[]});
			instance.should.have.property('id', 'bar@1.0.0');
		});
	});

	describe('workflow', function () {
		describe('load()', function () {
			it('should load and store js file contents', function (done) {
				co(function *() {
					var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
					yield instance.load();
					instance.content.should.eql(instance.originalContent);
					instance.content.should.eql("module.exports = 'main';");
					done();
				})();
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
				instance.compress()
				instance.content.should.eql("body{background-color:#000}");
			});
		});

		describe.skip('parse()', function () {
			it('should store an array of js dependencies', function (done) {
				var options = {type:'js', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, bar = fileFactory(path.resolve('src/bar.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar bar = require('./bar');"
				instance.parse()
					.then(function (files) {
						files.should.have.length(2);
						instance.dependencies.should.have.length(2);
						done();
					});
			});
			it('should store an array of css dependency objects', function (done) {
				var options = {type:'css', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.css'), options)
					, instance = fileFactory(path.resolve('src/main.css'), options);
				instance.content = "@import 'foo'"
				instance.parse()
					.then(function (files) {
						files.should.have.length(1);
						instance.dependencies.should.have.length(1);
						done();
					});
			});
			it('should store an array of html dependency objects', function (done) {
				var options = {type:'html', sources:[path.resolve('src')], fileExtensions:[ 'html', 'dust']}
					, foo = fileFactory(path.resolve('src/foo.dust'), options)
					, instance = fileFactory(path.resolve('src/main.dust'), options);
				instance.content = "{>foo /}"
				instance.parse()
					.then(function (files) {
						instance.dependencies.should.have.length(1);
						done();
					});
			});
			it('should only store 1 dependency object when there are duplicates', function (done) {
				var options = {type:'js', sources:[path.resolve('src')]}
					, foo = fileFactory(path.resolve('src/foo.js'), options)
					, instance = fileFactory(path.resolve('src/main.js'), options);
				instance.content = "var foo = require('./foo');\nvar foo = require('./foo');"
				instance.parse()
					.then(function (files) {
						files.should.have.length(1);
						instance.dependencies.should.have.length(1);
						done();
					});
			});
		});

		describe('replace()', function () {
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
				instance.replace();
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
				instance.replace();
				instance.content.should.eql("var bar = require('bar@0');\nvar baz = require('view/baz');");
			});
		});

		describe('inline()', function () {
			it('should inline require(*.json) content', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = require('./foo.json');";
				instance.dependencyReferences = [
					{
						filepath:'./foo.json',
						context: "require('./foo.json')"
					}
				];
				instance.inline();
				instance.content.should.eql('var foo = {\"foo\":\"bar\"};');
			});
			it('should inline an empty object when unable to locate require(*.json) content', function () {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = "var foo = require('./bar.json');";
				instance.dependencyReferences = [
					{
						filepath:'./bar.json',
						context: "require('./bar.json')"
					}
				];
				instance.inline();
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
				instance.inline();
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
				instance.inline();
				instance.content.should.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
			});
		});

		describe.skip('run()', function () {
			it('should execute a workflow in sequence', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.run(['load', 'wrap'])
					.then(function (files) {
						files.should.have.length(1);
						instance.content.should.eql("require.register('main', function(module, exports, require) {\n  module.exports = 'main';\n});");
						done();
					});
			});
			it('should return several files when parsing dependencies', function (done) {
				var instance = fileFactory(path.resolve('src/bar.js'), {type:'js', sources:[path.resolve('src')]});
				instance.run(['load', 'parse'])
					.then(function (files) {
						files.should.have.length(2);
						instance.content.should.eql("var foo = require(\'./foo\');\n\nmodule.exports = \'bar\';");
						done();
					});
			});
		});
	});
});
