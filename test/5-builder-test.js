// Debug settings
require('../lib/utils/cnsl').silent = true;

var path = require('path')
	, fs = require('fs')
	, co = require('co')
	, rimraf = require('rimraf')
	, should = require('should')
	, Builder = require('../lib/builder')
	, configuration = require('../lib/core/configuration');

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
	beforeEach(function () {
		this.builder = new Builder();
	});
	afterEach(function () {
		this.builder = null;
		rimraf.sync(path.resolve('output'));
	});

	describe('parsing build target', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/init'));
		});
		it('should result in a target count of 1 for valid target data', function () {
			var targets = this.builder._initializeTargets([{input: 'target/foo.js', output: 'main.js', runtimeOptions: {}}]);
			targets.should.have.length(1);
		});
		it('should result in a target count of 2 with valid target data containing a child target', function () {
			var targets = this.builder._initializeTargets([{input: 'target/foo.js', output: 'main.js', hasChildren: true, runtimeOptions: {}, targets:[{input:'target/lib', output:'../js', runtimeOptions: {}}]}]);
			targets.should.have.length(2);
		});
	});

	describe('building file targets', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-file.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
		describe('with a single coffee file containing a multi-line comment', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-file-multi-comment.js')
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
		describe('with a single coffee file requiring 1 dependency', function () {
			it('should build 1 js file with 2 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-file-with-dependency.js');
					fs.existsSync(filepaths[0]).should.be.true;
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('package/Class'");
					contents.should.include("require.register('package/ClassCamelCase'");
					done();
				}).call(this);
			});
		});
		describe('with a single coffee file containing a module wrapper', function () {
			it('should build 1 js file containing only 1 module wrapper', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-file-with-wrapper.js')
					fs.existsSync(filepaths[0]).should.be.true;
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.indexOf('require.register').should.eql(contents.lastIndexOf('require.register'));
					done();
				}).call(this);
			});
		});
		describe('with a single handlebars template file', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-handlebars-file.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
		describe('with a single stylus file', function () {
			it('should build 1 css file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-styl-file.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
		describe('with a single less file', function () {
			it('should build 1 css file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_single-less-file.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
	});

	describe('building directory targets', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/library'));
		});
		describe('with 3 coffee files', function () {
			it('should build 3 js files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.readFileSync(filepath, 'utf8').should.include('require.register(');
					});
					done();
				}).call(this);
			});
		});
		describe('with 3 coffee files and the "modular" property set to false', function () {
			it('should build 3 js files without module wrappers', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-nodejs.js');
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.readFileSync(filepath, 'utf8').should.not.include('require.register(');
					});
					done();
				}).call(this);
			});
		});
		describe('with 2 stylus files', function () {
			it('should build 2 css files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_styl.js');
					filepaths.should.have.length(2);
					done();
				}).call(this);
			});
		});
		describe('with 2 js files referencing 2 dependencies', function () {
			it('should build 2 js files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_dir-with-dependencies.js');
					filepaths.should.have.length(2);
					fs.readFileSync(filepaths[0], 'utf8').should.include('require.register(\'package/foo');
					fs.readFileSync(filepaths[1], 'utf8').should.include('require.register(\'package/foo');
					done();
				}).call(this);
			});
		})
	});

	describe('building a project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file and a stylus directory', function () {
			it('should build 1 concatenated js file and 2 css files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						fs.existsSync(filepaths[0]).should.be.true;
					filepaths.should.have.length(3);
					done();
				}).call(this);
			});
		});
	});

	describe('building a partial project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-partial'));
		});
		describe('with a single coffee file and a missing stylus directory', function () {
			it('should build 1 concatenated js file ', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						fs.existsSync(filepaths[0]).should.be.true;
					filepaths.should.have.length(1);
					done();
				}).call(this);
			});
		});
	});

	describe('building a complex project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-complex'));
		});
		describe('with 2 js targets and 1 child target sharing assets', function () {
			it('should build 3 concatenated js files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					fs.existsSync(filepaths[2]).should.be.true;
					filepaths.should.have.length(3);
					done();
				}).call(this);
			});
			it('should build a child js file without source shared with it`s parent', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					var contents = fs.readFileSync(path.resolve('output/somesection.js'), 'utf8');
					contents.should.not.include("require.register('utils/util'");
					done();
				}).call(this);
			});
			it.only('should build a child js file that is different than the same file built without a parent target', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					filepaths.forEach(function(filepath) {
						console.log('-----------', filepath, '\n', fs.readFileSync(filepath, 'utf8'))
					})
					fs.readFileSync(path.resolve('output/section.js'), 'utf8').should.not.eql(fs.readFileSync(path.resolve('output/somesection.js'), 'utf8'));
					done();
				}).call(this);
			});
		});
	});

	describe('building a js project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-js'));
		});
		describe('with a single js file requiring 1 dependency', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
			it('should contain 2 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main'");
					contents.should.include("require.register('package/ClassCamelCase'");
					done();
				}).call(this);
			});
		});
		describe('with a single js file requiring 1 wrapped dependency', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_wrapped.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
			it('should contain 2 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_wrapped.js');
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('mainWrapped'");
					contents.should.include("require.register('package/prewrapped'");
					done();
				}).call(this);
			});
		});
		describe('with a directory of empty js files', function () {
			it('should build 2 js files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy_empty.js');
						fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					done();
				}).call(this);
			});
		});
	});

	describe('building a js project with node_modules', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-node_modules'));
		});
		describe('with a single js file requiring 1 npm dependency', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
			it('should contain 2 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main'");
					contents.should.include("require.register('baz@0'");
					done();
				}).call(this);
			});
		});
		describe('with a single js file requiring 1 local dependency requiring 1 npm dependency requiring 1 npm dependency', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-sub.js');
						filepaths.should.have.length(1);
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
			it('should contain 4 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-sub.js');
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main-sub'");
						contents.should.include("require.register('nested/baz'");
						contents.should.include("require.register('foo@0'");
					contents.should.include("require.register('bar@0'");
					done();
				}).call(this);
			});
		});
		describe('with nested main file requiring 1 relative local dependency', function () {
			it('should build 1 js file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-nested.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
			it('should contain 2 modules', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-nested.js');
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('bar@0'");
						contents.should.include("require.register('bar/dist/commonjs/lib/bar@0'");
					contents.should.include("exports.bar = require('bar/dist/commonjs/lib/bar@0');");
					done();
				}).call(this);
			});
		});
	});

	describe('building a css project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-css'));
		});
		describe('with 2 stylus files referencing a shared dependency', function () {
			it('should build 2 css files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						fs.existsSync(path.resolve(this.builder.targets[0].output, 'one.css')).should.be.true;
						fs.existsSync(path.resolve(this.builder.targets[0].output, 'two.css')).should.be.true;
					fs.existsSync(path.resolve(this.builder.targets[0].output, 'three.css')).should.be.false;
					done();
				}).call(this);
			});
			it('should import the dependency into both files', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
						var contents1 = fs.readFileSync(path.resolve(this.builder.targets[0].output, 'one.css'), 'utf8');
						var contents2 = fs.readFileSync(path.resolve(this.builder.targets[0].output, 'two.css'), 'utf8');
						contents1.should.eql(contents2);
						contents1.should.include("colour: '#ffffff';");
					contents2.should.include("colour: '#ffffff';");
					done();
				}).call(this);
			});
		});
	});

	describe('building an html project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-html'));
		});
		describe('with 1 jade file', function () {
			it('should build 1 html file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy.js');
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				}).call(this);
			});
		});
		describe('with 1 jade file with 2 includes', function () {
			it('should build 1 html file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-include.js');
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
					content.indexOf('<footer>').should.not.equal(-1);
					done();
				}).call(this);
			});
		});
		describe('with 1 jade file and local data file', function () {
			it('should build 1 html file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-data.js');
						content = fs.readFileSync(filepaths[0], 'utf8');
						fs.existsSync(filepaths[0]).should.be.true;
					content.should.include('<h1>Title</h1>');
					done();
				}).call(this);
			});
		});
		describe('with 1 dust file with nested includes', function () {
			it('should build 1 html file', function (done) {
				co(function* () {
					var filepaths = yield this.builder._build('buddy-include-dust.js');
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
					content.should.include('<footer>');
					done();
				}).call(this);
			});
		});
	});
});
