var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, should = require('should')
	, Builder = require('../lib/builder')
	, configuration = require('../lib/configuration');

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
			var targets = this.builder.initializeTargets([{inputPath: path.resolve('target/foo.js'), input: 'target/foo.js', output: 'main.js', runtimeOptions: {}}]);
			targets.should.have.length(1);
		});
		it('should result in a target count of 1 with valid target data containing a child target', function () {
			var targets = this.builder.initializeTargets([{inputPath: path.resolve('target/foo.js'), input: 'target/foo.js', output: 'main.js', hasChildren: true, runtimeOptions: {}, targets:[{inputPath: path.resolve('target/lib'), input:'target/lib', output:'../js', runtimeOptions: {}}]}]);
			targets.should.have.length(1);
		});
	});

	describe('building file targets', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy_single-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should build 1 js file when passed a JSON config object', function (done) {
				this.builder.build({
					build: {
						"js": {
							"sources": ["src/coffee"],
							"targets": [
								{
									"input": "src/coffee/package/Class.coffee",
									"output": "output"
								}
							]
						}
					}
				}, null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with a single coffee file containing a multi-line comment', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy_single-file-multi-comment.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with a single coffee file requiring 1 dependency', function () {
			it('should build 1 js file with 2 modules', function (done) {
				this.builder.build('buddy_single-file-with-dependency.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('package/Class'");
					contents.should.include("require.register('package/ClassCamelCase'");
					done();
				});
			});
		});
		describe('with a single coffee file containing a module wrapper', function () {
			it('should build 1 js file containing only 1 module wrapper', function (done) {
				this.builder.build('buddy_single-file-with-wrapper.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.indexOf('require.register').should.eql(contents.lastIndexOf('require.register'));
					done();
				});
			});
		});
		describe.skip('with a single es6 file', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy_single-es6-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.match(/nums\.map\(function \(n\) {/);
					done();
				});
			});
		});
		describe('with a single handlebars template file', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy_single-handlebars-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with a single stylus file', function () {
			it('should build 1 css file', function (done) {
				this.builder.build('buddy_single-styl-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with a single less file', function () {
			it('should build 1 css file', function (done) {
				this.builder.build('buddy_single-less-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with a single js file with unique output pattern name', function () {
			it('should build 1 js file with unique hashed name', function (done) {
				this.builder.build('buddy_single-unique-file.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					path.basename(filepaths[0]).should.eql('foo-35a993272c713bfdda813b3e5dc78845.js');
					done();
				});
			});
		});
	});

	describe('building directory targets', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/library'));
		});
		describe('with 3 coffee files', function () {
			it('should build 3 js files', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.readFileSync(filepath, 'utf8').should.include('require.register(');
					});
					done();
				});
			});
		});
		describe('with 3 coffee files and the "modular" property set to false', function () {
			it('should build 3 js files without module wrappers', function (done) {
				this.builder.build('buddy-nodejs.js', null, function (err, filepaths) {
					filepaths.should.have.length(3);
					filepaths.forEach(function (filepath) {
						fs.readFileSync(filepath, 'utf8').should.not.include('require.register(');
					});
					done();
				});
			});
		});
		describe('with 2 stylus files', function () {
			it('should build 2 css files', function (done) {
				this.builder.build('buddy_styl.js', null, function (err, filepaths) {
					filepaths.should.have.length(2);
					done();
				});
			});
		});
		describe('with 2 js files referencing 2 dependencies', function () {
			it('should build 2 js files', function (done) {
				this.builder.build('buddy_dir-with-dependencies.js', null, function (err, filepaths) {
					filepaths.should.have.length(2);
					fs.readFileSync(filepaths[0], 'utf8').should.include('require.register(\'package/foo');
					fs.readFileSync(filepaths[1], 'utf8').should.include('require.register(\'package/foo');
					done();
				});
			});
		})
	});

	describe('building a project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'));
		});
		describe('with a single coffee file and a stylus directory', function () {
			it('should build 1 concatenated js file and 2 css files', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
					filepaths.should.have.length(3);
					done();
				});
			});
		});
	});

	describe('building a partial project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-partial'));
		});
		describe('with a single coffee file and a missing stylus directory', function () {
			it('should build 1 concatenated js file ', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
						fs.existsSync(filepaths[0]).should.be.true;
					filepaths.should.have.length(1);
					done();
				});
			});
		});
	});

	describe('building a complex project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-complex'));
		});
		describe('with 2 js targets and 1 child target sharing assets', function () {
			it('should build 3 concatenated js files', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					fs.existsSync(filepaths[2]).should.be.true;
					filepaths.should.have.length(3);
					done();
				});
			});
			it('should build a child js file without source shared with it`s parent', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					var contents = fs.readFileSync(path.resolve('output/somesection.js'), 'utf8');
					contents.should.not.include("require.register('utils/util'");
					done();
				});
			});
			it('should build a child js file that is different than the same file built without a parent target', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.readFileSync(path.resolve('output/section.js'), 'utf8').should.not.eql(fs.readFileSync(path.resolve('output/somesection.js'), 'utf8'));
					done();
				});
			});
		});
	});

	describe('building a project with circular references', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-circ'));
		});
		it('should build 1 concatenated js file', function (done) {
			this.builder.build('buddy.js', null, function (err, filepaths) {
				filepaths.should.have.length(1);
				fs.readFileSync(filepaths[0], 'utf8').should.endWith("require.register(\'model\', function(module, exports, require) {\n  var app = require(\'app\');\n  \n  module.exports = \'model\';\n});\nrequire.register(\'view\', function(module, exports, require) {\n  var app = require(\'app\'),\n      model = require(\'model\');\n  \n  module.exports = \'view\';\n});\nrequire.register(\'app\', function(module, exports, require) {\n  module.exports = \'app\';\n  \n  var view = require(\'view\'),\n      model = require(\'model\');\n});")
				done();
			});
		});
	});

	describe('building a js project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-js'));
		});
		describe('with a single js file requiring 1 dependency', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should contain 2 modules', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
						var contents = fs.readFileSync(filepaths[0], 'utf8');
						contents.should.include("require.register('main'");
					contents.should.include("require.register('package/ClassCamelCase'");
					done();
				});
			});
		});
		describe('with a single js file requiring 1 wrapped dependency', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy_wrapped.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should contain 2 modules', function (done) {
				this.builder.build('buddy_wrapped.js', null, function (err, filepaths) {
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('mainWrapped'");
					contents.should.include("require.register('package/prewrapped'");
					done();
				});
			});
		});
		describe('with a directory of empty js files', function () {
			it('should build 2 js files', function (done) {
				this.builder.build('buddy_empty.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					done();
				});
			});
		});
		describe('with an input targeting an array of files', function () {
			it('should build 2 js files', function (done) {
				this.builder.build('buddy_multiple.js', null, function (err, filepaths) {
					filepaths.should.have.length(2);
					fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					done();
				});
			});
		});
		describe('with an input targeting a glob pattern of files', function () {
			it('should build 4 js files found in nested directories', function (done) {
				this.builder.build('buddy_glob.js', null, function (err, filepaths) {
					filepaths.should.have.length(4);
					fs.existsSync(filepaths[0]).should.be.true;
					fs.existsSync(filepaths[1]).should.be.true;
					done();
				});
			});
		});
	});

	describe('building a js project with node_modules', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-node_modules'));
		});
		describe('with a single js file requiring 1 npm dependency', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should contain 2 modules', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('main'");
					contents.should.include("require.register('baz@0.0.0'");
					done();
				});
			});
		});
		describe('with a single js file requiring 1 local dependency requiring 1 npm dependency requiring 1 npm dependency', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy-sub.js', null, function (err, filepaths) {
					filepaths.should.have.length(1);
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should contain 4 modules', function (done) {
				this.builder.build('buddy-sub.js', null, function (err, filepaths) {
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('main-sub'");
					contents.should.include("require.register('nested/baz'");
					contents.should.include("require.register('foo@0.0.0'");
					contents.should.include("require.register('bar@0.0.0'");
					done();
				});
			});
		});
		describe('with nested main file requiring 1 relative local dependency', function () {
			it('should build 1 js file', function (done) {
				this.builder.build('buddy-nested.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
			it('should contain 2 modules', function (done) {
				this.builder.build('buddy-nested.js', null, function (err, filepaths) {
					var contents = fs.readFileSync(filepaths[0], 'utf8');
					contents.should.include("require.register('bar@0.0.0'");
					contents.should.include("require.register('bar/dist/commonjs/lib/bar@0.0.0'");
					contents.should.include("exports.bar = require('bar/dist/commonjs/lib/bar@0.0.0');");
					done();
				});
			});
		});
	});

	describe('building a css project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-css'));
		});
		describe('with 2 stylus files referencing a shared dependency', function () {
			it('should build 2 css files', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.existsSync(path.resolve(this.builder.targets[0].output, 'one.css')).should.be.true;
					fs.existsSync(path.resolve(this.builder.targets[0].output, 'two.css')).should.be.true;
					fs.existsSync(path.resolve(this.builder.targets[0].output, 'three.css')).should.be.false;
					done();
				}.bind(this));
			});
			it('should import the dependency into both files', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
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

	describe('building an html project', function () {
		before(function () {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-html'));
		});
		describe('with 1 jade file', function () {
			it('should build 1 html file', function (done) {
				this.builder.build('buddy.js', null, function (err, filepaths) {
					fs.existsSync(filepaths[0]).should.be.true;
					done();
				});
			});
		});
		describe('with 1 jade file with 2 includes', function () {
			it('should build 1 html file', function (done) {
				this.builder.build('buddy-include.js', null, function (err, filepaths) {
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
					content.indexOf('<footer>').should.not.equal(-1);
					done();
				});
			});
		});
		describe('with 1 jade file and local data file', function () {
			it('should build 1 html file', function (done) {
				this.builder.build('buddy-data.js', null, function (err, filepaths) {
						content = fs.readFileSync(filepaths[0], 'utf8');
						fs.existsSync(filepaths[0]).should.be.true;
					content.should.include('<h1>Title</h1>');
					done();
				});
			});
		});
		describe('with 1 dust file with nested includes', function () {
			it('should build 1 html file', function (done) {
				this.builder.build('buddy-include-dust.js', null, function (err, filepaths) {
						var filepath = filepaths[0]
							, content = fs.readFileSync(filepath, 'utf8');

						fs.existsSync(filepath).should.be.true;
					content.should.include('<footer>');
					done();
				});
			});
		});
	});
});
