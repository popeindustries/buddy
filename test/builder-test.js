// Debug settings
require('../lib/utils/cnsl').silent = true;
require('buddy-term').silent = true;
require('bluebird').longStackTraces();

var path = require('path')
	, fs = require('fs')
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

describe.skip('Builder', function() {
	beforeEach(function() {
		this.builder = new Builder();
	});
	afterEach(function() {
		this.builder = null;
		rimraf.sync(path.resolve('output'));
	});

	describe('parsing build target', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/init'));
		});
		it('should result in a target count of 1 for valid target data', function() {
			var targets = this.builder._initializeTargets([{input: 'target/foo.js', output: 'main.js', runtimeOptions: {}}]);
			targets.should.have.length(1);
		});
		it('should result in a target count of 2 with valid target data containing a child target', function() {
			var targets = this.builder._initializeTargets([{input: 'target/foo.js', output: 'main.js', hasChildren: true, runtimeOptions: {}, targets:[{input:'target/lib', output:'../js', runtimeOptions: {}}]}]);
			targets.should.have.length(2);
		});
	});

	describe('building file targets', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy_single-file.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
		describe('with a single coffee file containing a multi-line comment', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy_single-file-multi-comment.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
		describe('with a single coffee file requiring 1 dependency', function() {
			it('should build 1 js file with 2 modules', function(done) {
				this.builder.build('buddy_single-file-with-dependency.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('package/Class'");
						contents.should.include("require.register('package/ClassCamelCase'");
						done();
					}.bind(this));
			});
		});
		describe('with a single coffee file containing a module wrapper', function() {
			it('should build 1 js file containing only 1 module wrapper', function(done) {
				this.builder.build('buddy_single-file-with-wrapper.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.indexOf('require.register').should.eql(contents.lastIndexOf('require.register'));
						done();
					}.bind(this));
			});
		});
		describe('with a single handlebars template file', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy_single-handlebars-file.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
		describe('with a single stylus file', function() {
			it('should build 1 css file', function(done) {
				this.builder.build('buddy_single-styl-file.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
		describe('with a single less file', function() {
			it('should build 1 css file', function(done) {
				this.builder.build('buddy_single-less-file.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
	});

	describe('building directory targets', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/library'));
		});
		describe('with 3 coffee files', function() {
			it('should build 3 js files', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						filepaths.should.have.length(3);
						filepaths.forEach(function(filepath) {
							fs.readFileSync(filepath, 'utf8').should.include('require.register(');
						});
						done();
					}.bind(this));
			});
		});
		describe('with 3 coffee files and the "modular" property set to false', function() {
			it('should build 3 js files without module wrappers', function(done) {
				this.builder.build('buddy-nodejs.js')
					.then(function (filepaths) {
						filepaths.should.have.length(3);
						filepaths.forEach(function(filepath) {
							fs.readFileSync(filepath, 'utf8').should.not.include('require.register(');
						});
						done();
					}.bind(this));
			});
		});
		describe('with 2 stylus files', function() {
			it('should build 2 css files', function(done) {
				this.builder.build('buddy_styl.js')
					.then(function (filepaths) {
						filepaths.should.have.length(2);
						done();
					}.bind(this));
			});
		});
	});

	describe('building a project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file and a stylus directory', function() {
			it('should build 1 concatenated js file and 2 css files', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						filepaths.should.have.length(3);
						done();
					}.bind(this));
			});
		});
	});

	describe('building a partial project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-partial'));
		});
		describe('with a single coffee file and a missing stylus directory', function() {
			it('should build 1 concatenated js file ', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						filepaths.should.have.length(1);
						done();
					}.bind(this));
			});
		});
	});

	describe('building a complex project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-complex'));
		});
		describe('with 2 js targets and 1 child target sharing assets', function() {
			it('should build 3 concatenated js files', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						fs.existsSync(filepaths[1]).should.be.true;
						fs.existsSync(filepaths[2]).should.be.true;
						filepaths.should.have.length(3);
						done();
					}.bind(this));
			});
			it('should build a child js file without source shared with it`s parent', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(path.resolve('output/somesection.js'), 'utf8');
						contents.should.not.include("require.register('utils/util',");
						done();
					}.bind(this));
			});
			it.skip('should build a child js file that is different than the same file built without a parent target', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.readFileSync(path.resolve('output/section.js'), 'utf8').should.not.eql(fs.readFileSync(path.resolve('output/somesection.js'), 'utf8'));
						done();
					}.bind(this));
			});
		});
	});

	describe('building a js project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-js'));
		});
		describe('with a single js file requiring 1 dependency', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
			it('should contain 2 modules', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main'");
						contents.should.include("require.register('package/ClassCamelCase'");
						done();
					}.bind(this));
			});
		});
		describe('with a single js file requiring 1 wrapped dependency', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy_wrapped.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
			it('should contain 2 modules', function(done) {
				this.builder.build('buddy_wrapped.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('mainWrapped'");
						contents.should.include("require.register('package/prewrapped'");
						done();
					}.bind(this));
			});
		});
		describe('with a directory of empty js files', function() {
			it('should build 2 js files', function(done) {
				this.builder.build('buddy_empty.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						fs.existsSync(filepaths[1]).should.be.true;
						done();
					}.bind(this));
			});
		});
	});

	describe('building a js project with node_modules', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-node_modules'));
		});
		describe('with a single js file requiring 1 npm dependency', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
			it.skip('should contain 2 modules', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						console.log(contents)
						contents.should.include("require.register('main'");
						contents.should.include("require.register('baz'");
						done();
					}.bind(this));
			});
		});
		describe('with a single js file requiring 1 local dependency requiring 1 npm dependency requiring 1 npm dependency', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy-sub.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
			it.skip('should contain 4 modules', function(done) {
				this.builder.build('buddy-sub.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main-sub'");
						contents.should.include("require.register('nested/baz'");
						contents.should.include("require.register('foo'");
						contents.should.include("require.register('bar'");
						done();
					}.bind(this));
			});
		});
		describe('with nested main file requiring 1 relative local dependency', function() {
			it('should build 1 js file', function(done) {
				this.builder.build('buddy-nested.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
			it.skip('should contain 2 modules', function(done) {
				this.builder.build('buddy-nested.js')
					.then(function (filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('bar'");
						contents.should.include("require.register('bar/dist/commonjs/lib/bar'");
						contents.should.include("exports.bar = require('bar/dist/commonjs/lib/bar'");
						done();
					}.bind(this));
			});
		});
	});

	describe('building a css project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-css'));
		});
		describe('with 2 stylus files referencing a shared dependency', function() {
			it('should build 2 css files', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(path.resolve(this.builder.targets[0].output, 'one.css')).should.be.true;
						fs.existsSync(path.resolve(this.builder.targets[0].output, 'two.css')).should.be.true;
						fs.existsSync(path.resolve(this.builder.targets[0].output, 'three.css')).should.be.false;
						done();
					}.bind(this));
			});
			it.skip('should import the dependency into both files', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						var contents1 = fs.readFileSync(path.resolve(this.builder.targets[0].output, 'one.css'), 'utf8');
						var contents2 = fs.readFileSync(path.resolve(this.builder.targets[0].output, 'two.css'), 'utf8');
						contents1.should.eql(contents2);
						contents1.should.include("colour: '#ffffff';");
						contents2.should.include("colour: '#ffffff';");
						done();
					}.bind(this));
			});
		});
	});

	describe('building an html project', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-html'));
		});
		describe('with 1 jade file', function() {
			it('should build 1 html file', function(done) {
				this.builder.build('buddy.js')
					.then(function (filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
						done();
					}.bind(this));
			});
		});
		describe('with 1 jade file with 2 includes', function() {
			it('should build 1 html file', function(done) {
				this.builder.build('buddy-include.js')
					.then(function (filepaths) {
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
						content.indexOf('<footer>').should.not.equal(-1);
						done();
					}.bind(this));
			});
		});
		describe('with 1 jade file and local data file', function() {
			it('should build 1 html file', function(done) {
				this.builder.build('buddy-data.js')
					.then(function (filepaths) {
						content = fs.readFileSync(filepaths[0], 'utf8');
						fs.existsSync(filepaths[0]).should.be.true;
						content.should.include('<h1>Title</h1>');
						done();
					}.bind(this));
			});
		});
		describe('with 1 dust file with nested includes', function() {
			it.skip('should build 1 html file', function(done) {
				this.builder.build('buddy-include-dust.js')
					.then(function (filepaths) {
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
						content.should.include('<footer>');
						done();
					}.bind(this));
			});
		});
	});
});
