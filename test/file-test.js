var path = require('path')
	, fs = require('fs')
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
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.load()
					.then(function () {
						instance.content.should.eql(instance.originalContent);
						instance.content.should.eql("var bar = require('./package/bar')\n\t, foo = require('./package/foo');");
						done();
					});
			});
		});

		describe('escape()', function () {
			it('should transform js file contents into an escaped string', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.load()
					.then(function () {
						return instance.escape();
					})
					.then(function () {
						instance.content.should.eql("\"var bar = require('./package/bar')\\n\t, foo = require('./package/foo');\"");
						done();
					});
			});
		});

		describe.skip('replace()', function () {
			// it('should replace relative require ids with absolute ones', function (done) {
			// 	var opts = {
			// 		type: 'js',
			// 		sources: [path.resolve('src')],
			// 		runtimeOptions: {}
			// 	};
			// 	var cache = new Cache();
			// 	var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
			// 	foo.content = fs.readFileSync(foo.filepath, 'utf8');
			// 	foo.dependencies = [];
			// 	cache.addFile(foo.filepath, foo);
			// 	var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
			// 	bar.content = fs.readFileSync(bar.filepath, 'utf8');
			// 	bar.dependencies = [{id:'./foo', idFull:'package/foo', filepath:foo.filepath}];
			// 	cache.addFile(bar.filepath, bar);
			// 	var main = fileFactory(path.resolve('src/main.js'), opts);
			// 	main.reset();
			// 	main.content = fs.readFileSync(main.filepath, 'utf8');
			// 	main.dependencies = [{id:'./package/bar', idFull:'package/bar', filepath:bar.filepath}, {id:'./package/foo', idFull:'package/foo', filepath:foo.filepath}];
			// 	cache.addFile(main.filepath, main);
			// 	main.replace({fileCache:cache})
			// 		.then(function () {
			// 			instance.content.should.eql("var bar = require('package/bar')\n\t, foo = require('package/foo');");
			// 			done();
			// 		});
			// });
		});

		describe('lint()', function () {
			it('should skip compileable files', function (done) {
				var instance = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint()
					.then(function (warnings) {
						should.not.exist(warnings);
						done();
					});
			});
			it('should not return lint errors for well written js content', function (done) {
				var instance = fileFactory(path.resolve('src/main-good.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint()
					.then(function (warnings) {
						should.not.exist(warnings);
						done();
					});
			});
			it('should return lint errors for badly written js content', function (done) {
				var instance = fileFactory(path.resolve('src/main-bad.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint()
					.then(function (warnings) {
						should.exist(warnings);
						done();
					});
			});
			it('should return lint errors for badly written css content', function (done) {
				var instance = fileFactory(path.resolve('src/main-bad.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint()
					.then(function (warnings) {
						should.exist(warnings);
						done();
					});
			});
		});

		describe('compress()', function () {
			it('should compress js file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.compress()
					.then(function () {
						instance.content.should.eql('var bar=require("./package/bar"),foo=require("./package/foo");');
						done();
					});
			});
			it('should compress css file contents', function (done) {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.compress()
					.then(function () {
						instance.content.should.eql("@import 'package/foo';body{background-color:#000}");
						done();
					});
			});
		});

		describe('wrap()', function () {
			it('should wrap js file contents in a module definition', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:false}});
				instance.id = 'main';
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.wrap()
					.then(function () {
						instance.content.should.eql("require.register(\'main\', function(module, exports, require) {\n  var bar = require(\'./package/bar\')\n  \t, foo = require(\'./package/foo\');\n});");
						done();
					});
			});
			it('should wrap js file contents in a lazy module definition', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:true}});
				instance.id = 'main';
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.wrap()
					.then(function () {
						instance.content.should.eql("require.register(\'main\', var bar = require(\'./package/bar\')\n\t, foo = require(\'./package/foo\'););");
						done();
					});
			});
		});

		describe('parse()', function () {
			it('should store an array of js dependencies', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.dependencies.should.have.length(2);
						done();
					});
			});
			it('should store an array of coffee dependency objects', function (done) {
				var instance = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')], fileExtensions:['coffee']});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.dependencies.should.have.length(2);
						instance.dependencies[0].id.should.eql('package/Class');
						done();
					});
			});
			it('should store an array of css dependency objects', function (done) {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.dependencies.should.have.length(1);
						instance.dependencies[0].id.should.eql('package/foo');
						done();
					});
			});
			it('should only store 1 dependency object when there are duplicates', function (done) {
				var instance = fileFactory(path.resolve('src/package/bat.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.dependencies.should.have.length(1);
						instance.dependencies[0].id.should.eql('package/foo');
						done();
					});
			});
			it.skip('should inline json content', function (done) {
				var instance = fileFactory(path.resolve('src/main-json.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.content.should.eql('var foo = {\"foo\":\"bar\"};');
						done();
					});
			});
			it.skip('should inline an empty string when unable to locate json content', function (done) {
				var instance = fileFactory(path.resolve('src/main-bad-json.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.content.should.eql('var foo = {};\nvar bar = {};');
						done();
					});
			});
			it('should store an array of html dependency objects', function (done) {
				var instance = fileFactory(path.resolve('src/main.dust'), {type:'html', sources:[path.resolve('src')], fileExtensions:[ 'html', 'dust']});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse()
					.then(function () {
						instance.dependencies.should.have.length(2);
						instance.dependencies[0].id.should.eql('package/template');
						done();
					});
			});
		});

		describe.skip('concat()', function () {
			it('should replace css @import rules with file contents', function (done) {
				var opts = {
					type: 'css',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var foo = fileFactory(path.resolve('src/package/foo.css'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				var main = fileFactory(path.resolve('src/main.css'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'package/foo', filepath:foo.filepath}];
				main.concat({fileCache:cache}, function (err) {
					main.content.should.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
					done();
				});
			});
			it('should replace css @import rules with file contents, allowing duplicates', function (done) {
				var opts = {
					type: 'css',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var foo = fileFactory(path.resolve('src/package/foo.css'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				var main = fileFactory(path.resolve('src/package/bar.css'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'foo', filepath:foo.filepath}];
				main.concat({fileCache:cache}, function (err) {
					main.content.should.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
					done();
				});
			});
			it('should combine js file contents', function (done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
				bar.content = fs.readFileSync(bar.filepath, 'utf8');
				bar.dependencies = [{id:'./foo', filepath:foo.filepath}];
				bar.concat({fileCache:cache}, function (err) {
					bar.content.should.eql("// var bat = require('./bat')\n\nmodule.exports = function (){};\nvar foo = require('./foo');\n\nmodule.exports = function () {};");
					done();
				});
			});
			it('should combine js file contents, avoiding duplicates', function (done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
				bar.content = fs.readFileSync(bar.filepath, 'utf8');
				bar.dependencies = [{id:'./foo', filepath:foo.filepath}];
				var main = fileFactory(path.resolve('src/main.js'), opts);
				main.reset();
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'./package/bar', filepath:bar.filepath}, {id:'./package/foo', filepath:foo.filepath}];
				main.concat({fileCache:cache}, function (err) {
					main.content.should.eql("// var bat = require('./bat')\n\nmodule.exports = function (){};\nvar foo = require('./foo');\n\nmodule.exports = function () {};\nvar bar = require('./package/bar')\n\t, foo = require('./package/foo');");
					done();
				});
			});
			it('should combine js contents, avoiding circular dependencies', function (done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var foo = fileFactory(path.resolve('src/package/circ.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [{id:'../main-circ', filepath:null}];
				var main = fileFactory(path.resolve('src/main-circ.js'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'foo', filepath:foo.filepath}];
				foo.dependencies[0].filepath = main.filepath;
				foo.dependencies[0].instance = main;
				main.concat({fileCache:cache}, function (err) {
					main.content.should.eql("var main = require('../main-circ')\n\t, circ = this;\nvar circ = require('./package/circ')\n\t, main = this;");
					done();
				});
			});
		});

		describe('run()', function () {
			it('should execute a workflow in sequence', function (done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:false}});
				instance.run(['load', 'wrap'])
					.then(function () {
						instance.content.should.eql("require.register(\'main\', function(module, exports, require) {\n  var bar = require(\'./package/bar\')\n  \t, foo = require(\'./package/foo\');\n});");
						done();
					});
			});
		});
	});
});
