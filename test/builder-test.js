var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, should = require('should')
	, Builder = require('../lib/builder')
	, configuration = require('../lib/core/configuration');

term = require('buddy-term').silent = true;

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

describe('Builder', function() {

	describe('parsing build target', function() {
		before(function() {
			process.chdir(path.resolve(__dirname, 'fixtures/builder/init'));
		});
		beforeEach(function() {
			this.builder = new Builder();
		});
		it('should result in a target count of 1 for valid target data', function() {
			this.builder._initializeTargets([{'input': 'target/main.coffee', 'output': 'main.js'}]);
			this.builder.targets.should.have.length(1);
		});
		it('should result in a target count of 2 with valid target data containing a child target', function() {
			this.builder._initializeTargets([{'input': 'target/main.coffee', 'output': 'main.js', 'hasChildren': true, 'targets':[{'input':'target/class', 'output':'../js'}]}]);
			this.builder.targets.should.have.length(2);
		});
	});
});

	// describe 'build', ->
	// 	beforeEach ->
	// 		@builder = new Builder
	// 		@builder.options.processors = processors
	// 	afterEach ->
	// 		@builder = null
	// 		rimraf.sync(path.resolve('output'))

	// 	describe 'file target', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'))
	// 		describe 'with a single coffee file', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy_single-file.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 		describe 'with a single coffee file requiring 1 dependency', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy_single-file-with-dependency.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 			it 'should contain 2 modules', (done) ->
	// 				@builder.build 'buddy_single-file-with-dependency.js', false, false, false, false, false, (err) =>
	// 					contents = fs.readFileSync(@builder.targets.js[0].output, 'utf8')
	// 					contents.should.include("require.register('package/class'")
	// 					contents.should.include("require.register('package/classcamelcase'")
	// 					done()
	// 		describe 'with a single coffee file containing a module wrapper', ->
	// 			it 'should build 1 js file containing only 1 module wrapper', (done) ->
	// 				@builder.build 'buddy_single-file-with-wrapper.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 		describe 'with a single livescript file', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy_single-ls-file.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 		describe 'with a single handlebars template file', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy_single-handlebars-file.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 		# describe.only 'with a single typescript file', ->
	// 		# 	it 'should build 1 js file', (done) ->
	// 		# 		@builder.build 'buddy_single-ts-file.js', false, false, false, false, false, (err) =>
	// 		# 			fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 		# 			done()
	// 		describe 'with a single stylus file', ->
	// 			it 'should build 1 css file', (done) ->
	// 				@builder.build 'buddy_single-styl-file.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.css[0].output).should.be.true
	// 					done()
	// 		describe 'with a single less file', ->
	// 			it 'should build 1 css file', (done) ->
	// 				@builder.build 'buddy_single-less-file.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.css[0].output).should.be.true
	// 					done()
	// 	describe 'directory target', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/library'))
	// 		describe 'with 3 coffee files', ->
	// 			it 'should build 3 js files', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					(files = gatherFiles(@builder.targets.js[0].output)).should.have.length(3)
	// 					for f in files
	// 						fs.readFileSync(f, 'utf8').should.include('require.register(')
	// 					done()
	// 		describe 'with 3 coffee files and the "modular" flag set to false', ->
	// 			it 'should build 3 js files without module wrappers', (done) ->
	// 				@builder.build 'buddy-nodejs.js', false, false, false, false, false, (err) =>
	// 					files = gatherFiles(@builder.targets.js[0].output)
	// 					for f in files
	// 						fs.readFileSync(f, 'utf8').should.not.include('require.register(')
	// 					done()
	// 		describe 'with 2 stylus files', ->
	// 			it 'should build 2 css files', (done) ->
	// 				@builder.build 'buddy_styl.js', false, false, false, false, false, (err) =>
	// 					gatherFiles(@builder.targets.css[0].output).should.have.length(2)
	// 					done()
	// 	describe 'project', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project'))
	// 		describe 'with a single coffee file and a stylus directory', ->
	// 			it 'should build 1 concatenated js file', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 			it 'should build 2 css files', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					gatherFiles(@builder.targets.css[0].output).should.have.length(2)
	// 					done()
	// 	describe 'project partial', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-partial'))
	// 		describe 'with a single coffee file and a missing stylus directory', ->
	// 			it 'should skip and not throw an error', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					should.not.exist(err)
	// 					done()
	// 			it 'should build 1 concatenated js file', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 	describe 'complex project', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-complex'))
	// 		describe 'with 2 js targets and 1 child target sharing assets', ->
	// 			it 'should build 3 concatenated js files', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					gatherFiles(path.resolve('output')).should.have.length(3)
	// 					done()
	// 			it 'should build a child js file without source shared with it`s parent', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					contents = fs.readFileSync(path.resolve('output/section.js'), 'utf8')
	// 					contents.should.not.include("require.module('utils/util',")
	// 					done()
	// 			it 'should build a child js file that is different than the same file built without a parent target', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.readFileSync(path.resolve('output/section.js'), 'utf8').should.not.eql(fs.readFileSync(path.resolve('output/section/someSection.js'), 'utf8'))
	// 					done()
	// 	describe 'js project', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-js'))
	// 		describe 'with a single js file requiring 1 dependency', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 			it 'should contain 2 modules', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					contents = fs.readFileSync(@builder.targets.js[0].output, 'utf8')
	// 					contents.should.include("require.register('main'")
	// 					contents.should.include("require.register('package/classcamelcase'")
	// 					done()
	// 		describe 'with a single js file requiring 1 wrapped dependency', ->
	// 			it 'should build 1 js file', (done) ->
	// 				@builder.build 'buddy_wrapped.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(@builder.targets.js[0].output).should.be.true
	// 					done()
	// 			it 'should contain 2 modules', (done) ->
	// 				@builder.build 'buddy_wrapped.js', false, false, false, false, false, (err) =>
	// 					contents = fs.readFileSync(@builder.targets.js[0].output, 'utf8')
	// 					contents.should.include("require.register('mainwrapped'")
	// 					contents.should.include("require.register('package/prewrapped'")
	// 					done()
	// 		describe 'with a directory of empty js files', ->
	// 			it 'should build 2 js files', (done) ->
	// 				@builder.build 'buddy_empty.js', false, false, false, false, false, (err) =>
	// 					gatherFiles(@builder.targets.js[0].output).should.have.length(2)
	// 					done()
	// 	describe 'css project', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-css'))
	// 		describe 'with 2 stylus files referencing a shared dependency', ->
	// 			it 'should build 2 css files', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(path.resolve(@builder.targets.css[0].output, 'one.css')).should.be.true
	// 					fs.existsSync(path.resolve(@builder.targets.css[0].output, 'two.css')).should.be.true
	// 					fs.existsSync(path.resolve(@builder.targets.css[0].output, 'three.css')).should.be.false
	// 					done()
	// 			it 'should import the dependency into both files', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					contents1 = fs.readFileSync(path.resolve(@builder.targets.css[0].output, 'one.css'), 'utf8')
	// 					contents2 = fs.readFileSync(path.resolve(@builder.targets.css[0].output, 'two.css'), 'utf8')
	// 					contents1.should.eql(contents2)
	// 					contents1.should.include("colour: '#ffffff';")
	// 					contents2.should.include("colour: '#ffffff';")
	// 					done()
	// 	describe 'html project', ->
	// 		before ->
	// 			process.chdir(path.resolve(__dirname, 'fixtures/builder/build/project-html'))
	// 		describe 'with 1 jade file', ->
	// 			it 'should build 1 html file', (done) ->
	// 				@builder.build 'buddy.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(path.resolve(@builder.targets.html[0].output)).should.be.true
	// 					done()
	// 		describe 'with 1 jade file with 2 includes', ->
	// 			it 'should build 1 html file', (done) ->
	// 				@builder.build 'buddy-include.js', false, false, false, false, false, (err) =>
	// 					fs.existsSync(path.resolve(@builder.targets.html[0].output)).should.be.true
	// 					done()
