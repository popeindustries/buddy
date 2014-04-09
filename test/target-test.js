var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, rimraf = require('rimraf')
	, fileFactory = require('../lib/core/file')
	, targetFactory = require('../lib/core/target')
	, cache = new (require('../lib/core/filecache'))();

describe.skip('target', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/target'));
	});
	beforeEach(function() {
		if (!fs.existsSync(path.resolve('temp'))) fs.mkdirSync(path.resolve('temp'));
	});
	afterEach(function() {
		cache.flush();
		rimraf.sync(path.resolve('temp'));
	});

	describe('factory', function() {
		it('should decorate a new Target instance with passed data', function() {
			targetFactory(cache, {input: 'src/some.coffee', output: 'js', runtimeOptions: {}}).should.have.property('output', 'js');
		});
	});

	describe('process', function() {
		before(function() {
			var File = this.File = function(id){
				this.total = 0;
				this.id = id;
			};
			this.File.prototype.action1 = function(options, fn) {
				this.total++;
				fn();
			};
			this.File.prototype.action2 = function(options, fn) {
				this.total++;
				fn();
			};
			this.File.prototype.action3 = function(options, fn) {
				this.total++;
				fn();
			};
			this.target = targetFactory(cache, {type:'js', fileExtensions:[], sources:[], runtimeOptions: {}});
			this.target.action1 = function(files, fn) {
				this.files.pop();
				fn();
			};
			this.target.action2 = function(files, fn) {
				this.files.push(new File('3'));
				fn();
			};
		});
		it('should serially apply a set of commands to a collection of items', function(done) {
			var files = [new this.File('1'), new this.File('2')];
			var commands = ['file:action1', 'file:action2'];
			this.target.process(files, commands, function(err) {
				should.not.exist(err);
				files[0].total.should.eql(2);
				done();
			});
		});
		it('should apply commands to a collection of items, including commands that reduce the collection', function(done) {
			var files = this.target.files = [new this.File('1'), new this.File('2')];
			var commands = ['file:action1', 'file:action2', 'target:action1', 'file:action3'];
			this.target.process(files, commands, function(err) {
				should.not.exist(err);
				files[0].total.should.eql(3);
				files.should.have.length(1);
				done();
			});
		});
		it('should apply commands to a collection of items, including commands that expand the collection', function(done) {
			var files = this.target.files = [new this.File('1'), new this.File('2')];
			var commands = ['file:action1', 'file:action2', 'target:action2', 'file:action3'];
			this.target.process(files, commands, function(err) {
				should.not.exist(err);
				files[0].total.should.eql(3);
				files[2].total.should.eql(1);
				files.should.have.length(3);
				done();
			});
		});
	});

	describe('getFile', function() {
		before(function() {
			this.target = targetFactory(cache, {type:'js', fileExtensions:[], sources:['src'], runtimeOptions:{filepath: path.resolve('temp')}});
		});
		afterEach(function() {
			this.target.reset();
		})
		it('should add a file to "sourceFiles", and update the file contents', function() {
			var file = this.target.getFile(path.resolve('src/js/foo.js'));
			this.target.sourceFiles[path.resolve('src/js/foo.js')].should.be.ok;
			file.content.should.be.ok;
		});
		it('should return null if file doesn\'t exist', function() {
			var file = this.target.getFile(path.resolve('src/bar.js'));
			should.not.exist(file);
		});
	});

	describe('parse', function() {
		beforeEach(function() {
			this.target = targetFactory(cache, {type:'js', outputPath: path.resolve('temp'), fileExtensions:['js', 'coffee'], sources:['src'], runtimeOptions:{}});
		});
		it('should parse a file "input" and process a basic workflow', function(done) {
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile'];
			this.target.parse(function(err) {
				this.target.outputFiles.should.have.length(1);
				done();
			}.bind(this));
		});
		it('should parse a directory "input" and process a basic workflow', function(done) {
			this.target.inputPath = path.resolve('src/js');
			this.target.isDir = true;
			this.target.workflow = ['file:compile'];
			this.target.parse(function(err) {
				this.target.outputFiles.should.have.length(4);
				done();
			}.bind(this));
		});
		it('should parse a directory "input" and process a workflow that filters the number of source files', function(done) {
			this.target.type = this.target.fileFactoryOptions.type = 'css';
			this.target.inputPath = path.resolve('src/css');
			this.target.isDir = true;
			this.target.workflow = ['file:parse', 'file:concat', 'target:filter'];
			this.target.parse(function(err) {
				this.target.outputFiles.should.have.length(1);
				done();
			}.bind(this));
		});
	});

	describe('build', function() {
		beforeEach(function() {
			this.target = targetFactory(cache, {type:'js', outputPath: path.resolve('temp'), fileExtensions:['js', 'coffee'], sources:['src'], runtimeOptions:{}});
		});
		it('should execute a "before" hook before running the build', function(done) {
			this.target.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', 'context.foo="foo";callback();');
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile'];
			this.target.foo = 'bar';
			this.target.build(function(err, paths) {
				this.target.foo.should.eql('foo');
				done();
			}.bind(this));
		});
		it('should execute an "after" hook after running the build', function(done) {
			this.target.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', 'context.foo="foo";callback();');
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile'];
			this.target.foo = 'bar';
			this.target.build(function(err, paths) {
				this.target.foo.should.eql('foo');
				done();
			}.bind(this));
		});
		it('should execute an "afterEach" hook after each processed file is ready to write to disk', function(done) {
			this.target.afterEach = new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', 'context.content="foo";callback();');
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile', 'target:write'];
			this.target.build(function(err, paths) {
				fs.readFileSync(path.resolve('temp/js/foo.js'), 'utf8').should.eql('foo');
				done();
			}.bind(this));
		});
		it('should return an error if a "before" hook returns an error', function(done) {
			this.target.before = new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', 'callback("oops");');
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile'];
			this.target.build(function(err, paths) {
				should.exist(err);
				done();
			}.bind(this));
		});
		it('should return an error if an "after" hook returns an error', function(done) {
			this.target.after = new Function('global', 'process', 'console', 'require', 'context', 'options', 'callback', 'callback("oops");');
			this.target.inputPath = path.resolve('src/js/foo.js');
			this.target.workflow = ['file:compile'];
			this.target.build(function(err, paths) {
				should.exist(err);
				done();
			}.bind(this));
		});
	});
});
