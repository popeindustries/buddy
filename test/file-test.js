var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, fileFactory = require('../lib/core/file')
	, Cache = require('../lib/core/filecache');

describe('file', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/file'));
	});

	describe('factory', function() {
		it('should decorate a new File instance with passed data', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('type', 'js');
			});
		});
		it('should resolve a module id for a File instance', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('id', 'main');
			});
		});
		it('should resolve a module id for an "index" File instance', function() {
			fileFactory(path.resolve('src/index.js'), {type:'js', sources:[path.resolve('src')]}, function(err, instance) {
				instance.should.have.property('id', 'src');
			});
		});
		it('should resolve a module id for a node_module "index" File instance ', function() {
			fileFactory(path.resolve('node_modules/foo/index.js'), {type:'js', sources:[]}, function(err, instance) {
				instance.should.have.property('id', 'foo');
			});
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function() {
			fileFactory(path.resolve('node_modules/bar/bar.js'), {type:'js', sources:[]}, function(err, instance) {
				instance.should.have.property('id', 'bar');
			});
		});
	});

	describe('workflow', function() {
		describe('read', function() {
			it('should read and store js file contents', function() {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content.should.eql(instance.originalContent);
				instance.content.should.eql("var bar = require('./package/bar')\n\t, foo = require('./package/foo');");
			});
		});

		describe('escape', function() {
			it('should transform js file contents into an escaped string', function(done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.escape(null, function(err, instance) {
					instance.content.should.eql("\"var bar = require('./package/bar')\\n\t, foo = require('./package/foo');\"");
					done();
				});
			});
		});

		describe('replace', function() {
			it('should replace relative require ids with absolute ones', function(done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				cache.addFile(foo.filepath, foo);
				var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
				bar.content = fs.readFileSync(bar.filepath, 'utf8');
				bar.dependencies = [{id:'./foo', idFull:'package/foo', filepath:foo.filepath}];
				cache.addFile(bar.filepath, bar);
				var main = fileFactory(path.resolve('src/main.js'), opts);
				main.reset();
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'./package/bar', idFull:'package/bar', filepath:bar.filepath}, {id:'./package/foo', idFull:'package/foo', filepath:foo.filepath}];
				cache.addFile(main.filepath, main);
				main.replace({fileCache:cache}, function(err, instance) {
					instance.content.should.eql("var bar = require('package/bar')\n\t, foo = require('package/foo');");
					done();
				});
			});
		});

		describe('lint', function() {
			it('should skip compileable files', function(done) {
				var instance = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint(null, function(err, instance) {
					should.not.exist(err);
					done();
				});
			});
			it('should not return lint errors for well written js content', function(done) {
				var instance = fileFactory(path.resolve('src/main-good.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint(null, function(err, instance) {
					should.not.exist(err);
					done();
				});
			});
			it('should return lint errors for badly written js content', function(done) {
				var instance = fileFactory(path.resolve('src/main-bad.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint(null, function(err, instance) {
					should.exist(err);
					done();
				});
			});
			it('should return lint errors for badly written css content', function(done) {
				var instance = fileFactory(path.resolve('src/main-bad.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.lint(null, function(err, instance) {
					should.exist(err);
					done();
				});
			});
		});

		describe('compress', function() {
			it('should compress js file contents', function(done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.compress(null, function(err, instance) {
					should.not.exist(err);
					instance.content.should.eql('var bar=require("./package/bar"),foo=require("./package/foo");');
					done();
				});
			});
			it('should compress css file contents', function(done) {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.compress(null, function(err, instance) {
					should.not.exist(err);
					instance.content.should.eql("body{background-color:#000}");
					done();
				});
			});
		});

		describe('wrap', function() {
			it('should wrap js file contents in a module definition', function(done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:false}});
				instance.id = 'main';
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.wrap(null, function(err, file) {
					should.not.exist(err);
					file.content.should.eql("require.register(\'main\', function(module, exports, require) {\n  var bar = require(\'./package/bar\')\n  \t, foo = require(\'./package/foo\');\n});");
					done();
				});
			});
			it('should wrap js file contents in a lazy module definition', function(done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')], runtimeOptions:{lazy:true}});
				instance.id = 'main';
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.wrap(null, function(err, file) {
					should.not.exist(err);
					file.content.should.eql("require.register(\'main\', var bar = require(\'./package/bar\')\n\t, foo = require(\'./package/foo\'););");
					done();
				});
			});
		});

		describe('parse', function() {
			it('should store an array of js dependency objects', function(done) {
				var instance = fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.dependencies.should.eql([
						{id:'./package/bar', idFull:'package/bar', filepath:path.resolve('src/package/bar.js')},
						{id:'./package/foo', idFull:'package/foo', filepath:path.resolve('src/package/foo.js')}
					]);
					done();
				});
			});
			it('should store an array of coffee dependency objects', function(done) {
				var instance = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')], fileExtensions:['coffee']});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.dependencies.should.eql([
						{id:'./package/Class', idFull:'package/Class', filepath:path.resolve('src/package/Class.coffee')},
						{id:'./package/ClassCamelCase', idFull:'package/ClassCamelCase', filepath:path.resolve('src/package/ClassCamelCase.coffee')}
					]);
					done();
				});
			});
			it('should store an array of css dependency objects', function(done) {
				var instance = fileFactory(path.resolve('src/main.css'), {type:'css', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.dependencies.should.eql([
						{id:'package/foo', idFull:'package/foo', filepath:path.resolve('src/package/foo.css')}
					]);
					done();
				});
			});
			it('should only store 1 dependency object when there are duplicates', function(done) {
				var instance = fileFactory(path.resolve('src/package/bat.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.dependencies.should.eql([{id:'./foo', idFull:'package/foo', filepath:path.resolve('src/package/foo.js')}]);
					done();
				});
			});
			it('should inline json content', function(done) {
				var instance = fileFactory(path.resolve('src/main-json.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.content.should.eql('var foo = {\"foo\":\"bar\"};');
					done();
				});
			});
			it('should inline an empty string when unable to locate json content', function(done) {
				var instance = fileFactory(path.resolve('src/main-bad-json.js'), {type:'js', sources:[path.resolve('src')]});
				instance.content = fs.readFileSync(instance.filepath, 'utf8');
				instance.parse(null, function(err, instance) {
					should.not.exist(err);
					instance.content.should.eql('var foo = {};\nvar bar = {};');
					done();
				});
			});
		});

		describe('concat', function() {
			it('should replace css @import rules with file contents', function(done) {
				var opts = {
					type: 'css',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/foo.css'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				cache.addFile(foo.filepath, foo);
				var main = fileFactory(path.resolve('src/main.css'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'package/foo', filepath:foo.filepath}];
				cache.addFile(main.filepath, main);
				main.concat({fileCache:cache}, function(err) {
					main.content.should.eql('div {\n\twidth: 50%;\n}\n\nbody {\n\tbackground-color: black;\n}');
					done();
				});
			});
			it('should replace css @import rules with file contents, allowing duplicates', function(done) {
				var opts = {
					type: 'css',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/foo.css'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				cache.addFile(foo.filepath, foo);
				var main = fileFactory(path.resolve('src/package/bar.css'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'foo', filepath:foo.filepath}];
				cache.addFile(main.filepath, main);
				main.concat({fileCache:cache}, function(err) {
					main.content.should.eql('div {\n\twidth: 50%;\n}\n\ndiv {\n\twidth: 50%;\n}\n');
					done();
				});
			});
			it('should combine js file contents', function(done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				cache.addFile(foo.filepath, foo);
				var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
				bar.content = fs.readFileSync(bar.filepath, 'utf8');
				bar.dependencies = [{id:'./foo', filepath:foo.filepath}];
				cache.addFile(bar.filepath, bar);
				bar.concat({fileCache:cache}, function(err) {
					bar.content.should.eql("// var bat = require('./bat')\n\nmodule.exports = function(){};\nvar foo = require('./foo');\n\nmodule.exports = function() {};");
					done();
				});
			});
			it('should combine js file contents, avoiding duplicates', function(done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/foo.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [];
				cache.addFile(foo.filepath, foo);
				var bar = fileFactory(path.resolve('src/package/bar.js'), opts);
				bar.content = fs.readFileSync(bar.filepath, 'utf8');
				bar.dependencies = [{id:'./foo', filepath:foo.filepath}];
				cache.addFile(bar.filepath, bar);
				var main = fileFactory(path.resolve('src/main.js'), opts);
				main.reset();
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'./package/bar', filepath:bar.filepath}, {id:'./package/foo', filepath:foo.filepath}];
				cache.addFile(main.filepath, main);
				main.concat({fileCache:cache}, function(err) {
					main.content.should.eql("// var bat = require('./bat')\n\nmodule.exports = function(){};\nvar foo = require('./foo');\n\nmodule.exports = function() {};\nvar bar = require('./package/bar')\n\t, foo = require('./package/foo');");
					done();
				});
			});
			it('should combine js contents, avoiding circular dependencies', function(done) {
				var opts = {
					type: 'js',
					sources: [path.resolve('src')],
					runtimeOptions: {}
				};
				var cache = new Cache();
				var foo = fileFactory(path.resolve('src/package/circ.js'), opts);
				foo.content = fs.readFileSync(foo.filepath, 'utf8');
				foo.dependencies = [{id:'../main-circ', filepath:null}];
				cache.addFile(foo.filepath, foo);
				var main = fileFactory(path.resolve('src/main-circ.js'), opts);
				main.content = fs.readFileSync(main.filepath, 'utf8');
				main.dependencies = [{id:'foo', filepath:foo.filepath}];
				cache.addFile(main.filepath, main);
				foo.dependencies[0].filepath = main.filepath;
				foo.dependencies[0].instance = main;
				main.concat({fileCache:cache}, function(err) {
					main.content.should.eql("var main = require('../main-circ')\n\t, circ = this;\nvar circ = require('./package/circ')\n\t, main = this;");
					done();
				});
			});
		});
	});
});
