path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Builder = require('../lib/builder')
target = require('../lib/target')
{log} = console

gatherFiles = (dir, files) ->
	files ||= []
	for item in fs.readdirSync(dir)
		p = path.resolve(dir, item)
		if fs.statSync(p).isFile()
			files.push(p)
		else
			gatherFiles(p, files)
	files

describe 'target', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))

	describe 'Target Class', ->
		describe 'initialize()', ->
			beforeEach ->
				@target = new target.Target(null, path.resolve('initialize/js'), {'byPath': []})
			describe 'batch property', ->
				it 'should return true when input is a directory', ->
					@target.input = path.resolve('initialize/src')
					@target.initialize()
					@target.batch.should.be.true

	describe 'JSTarget Class', ->
		describe 'initialize()', ->
			beforeEach ->
				@target = new target.JSTarget(null, path.resolve('initialize/js'), {'byPath': []})
			describe 'output property', ->
				it 'should resolve to a single .js file when input is file and output is directory', ->
					@target.input = path.resolve('initialize/src/package/Class.coffee')
					@target.initialize()
					@target.output.should.equal(path.resolve('initialize/js/Class.js'))
			describe 'batch property', ->
				it 'should return true when nodejs property is true', ->
					@target.input = path.resolve('initialize/src/main.coffee')
					@target.nodejs = true
					@target.initialize()
					@target.batch.should.be.true

		describe 'parsing input sources', ->
			beforeEach ->
				@builder = new Builder
				@builder.base = '.'
				@builder._parseSourceDirectory('initialize/src', null, @builder.jsSources)
				@target = new target.JSTarget(null, path.resolve('js'), @builder.jsSources)
			describe 'with a single input source and no dependencies', ->
				it 'should result in a source count of 1', ->
					@target.input = path.resolve('initialize/src/package/Class.coffee')
					@target.initialize()
					@target.sources.should.have.length(1)
				it 'should flag the input source as the main entry point', ->
					@target.input = path.resolve('initialize/src/package/Class.coffee')
					@target.initialize()
					@target.sources[0].main.should.be.true
			describe 'with a single input source and 1 dependency', ->
				it 'should result in a source count of 2', ->
					@target.input = path.resolve('initialize/src/package/ClassCamelCase.coffee')
					@target.initialize()
					@target.sources.should.have.length(2)
			describe 'with a single input source duplicated in a parent target', ->
				it 'should result in a source count of 0', ->
					t = {}
					t.hasSource = -> true
					@target.parentTarget = t
					@target.input = path.resolve('initialize/src/main.coffee')
					@target.initialize()
					@target.sources.should.have.length(0)
			describe 'with a single input source and 2 circular dependencies', ->
				it 'should result in a source count of 3', ->
					@target.input = path.resolve('initialize/src/circular/circular.coffee')
					@target.initialize()
					@target.sources.should.have.length(3)

		describe 'compiling', ->
			beforeEach ->
				@builder = new Builder
				@path = ''
			afterEach ->
				@builder = null
				rimraf.sync(path.resolve(@path + 'output'))
			describe 'file target', ->
				describe 'with a single coffee file', ->
					it 'should build 1 js file', ->
						@path = 'compile/project/'
						@builder.initialize(@path + 'buddy_single-file.json')
						@builder.compile()
						path.existsSync(@builder.jsTargets[0].output).should.be.true
				describe 'with a single coffee file requiring 1 dependency', ->
					beforeEach ->
						@path = 'compile/project/'
						@builder.initialize(@path + 'buddy_single-file-with-dependency.json')
						@builder.compile()
					it 'should build 1 js file', ->
						path.existsSync(@builder.jsTargets[0].output).should.be.true
					it 'should contain 2 modules', ->
						contents = fs.readFileSync(@builder.jsTargets[0].output, 'utf8')
						contents.should.include("require.module('package/class'")
						contents.should.include("require.module('package/class_camel_case'")
				describe 'with a single coffee file containing a module wrapper', ->
					beforeEach ->
						@path = 'compile/project/'
						@builder = new Builder
						@builder.initialize(@path + 'buddy_single-file-with-wrapper.json')
						@builder.compile()
					it 'should build 1 js file containing only 1 module wrapper', ->
						path.existsSync(@builder.jsTargets[0].output).should.be.true
				## Some sort of error here when splitting into separate tests ##
					# it 'should contain only 1 module wrapper', ->
						contents = fs.readFileSync(@builder.jsTargets[0].output, 'utf8')
						contents.match(/require.module\('wrapped'/gm).should.have.length(1)
				describe 'with a single stylus file', ->
					it 'should build 1 css file', ->
						@path = 'compile/project/'
						@builder.initialize(@path + 'buddy_single-styl-file.json')
						@builder.compile()
						path.existsSync(@builder.cssTargets[0].output).should.be.true
				describe 'with a single less file', ->
					it 'should build 1 css file', ->
						@path = 'compile/project/'
						@builder.initialize(@path + 'buddy_single-less-file.json')
						@builder.compile()
						path.existsSync(@builder.cssTargets[0].output).should.be.true
			describe 'directory target', ->
				describe 'with 3 coffee files', ->
					it 'should build 3 js files', ->
						@path = 'compile/library/'
						@builder.initialize(@path + 'buddy.json')
						@builder.compile()
						gatherFiles(@builder.jsTargets[0].output).should.have.length(3)
				describe 'with 3 coffee files and the "nodejs" flag set', ->
					it 'should build 3 js files without module wrappers', ->
						@path = 'compile/library/'
						@builder.initialize(@path + 'buddy-nodejs.json')
						@builder.compile()
						files = gatherFiles(@builder.jsTargets[0].output)
						for f in files
							fs.readFileSync(f, 'utf8').should.not.include('require.module(')
				describe 'with 2 stylus files', ->
					it 'should build 2 css files', ->
						@path = 'compile/library/'
						@builder.initialize(@path + 'buddy_styl.json')
						@builder.compile()
						gatherFiles(@builder.cssTargets[0].output).should.have.length(2)
			describe 'project', ->
				describe 'with a single coffee file and a stylus directory', ->
					beforeEach ->
						@path = 'compile/project/'
						@builder.initialize(@path + 'buddy.json')
						@builder.compile()
					it 'should build 1 concatenated js file', ->
						path.existsSync(@builder.jsTargets[0].output).should.be.true
					it 'should build 2 css files', ->
						gatherFiles(@builder.cssTargets[0].output).should.have.length(2)
			describe 'complex project', ->
				describe 'with 2 js targets and 1 child target sharing assets', ->
					beforeEach ->
						@path = 'compile/project-complex/'
						@builder.initialize(@path + 'buddy.json')
						@builder.compile()
					it 'should build 3 concatenated js files', ->
						gatherFiles(path.resolve(@path + 'output')).should.have.length(3)
					it 'should build a child js file without require.js source', ->
						contents = fs.readFileSync(path.resolve(@path + 'output/section.js'), 'utf8')
						contents.should.not.include('require = function(path)')
					it 'should build a child js file without source shared with it`s parent', ->
						contents = fs.readFileSync(path.resolve(@path + 'output/section.js'), 'utf8')
						contents.should.not.include("require.module('utils/util',")
					it 'should build a child js file that is different than the same file built without a parent target', ->
						fs.readFileSync(path.resolve(@path + 'output/section.js'), 'utf8').should.not.eql(fs.readFileSync(path.resolve(@path + 'output/section/someSection.js'), 'utf8'))
			describe 'js project', ->
				describe 'with a single js file requiring 1 dependency', ->
					beforeEach ->
						@path = 'compile/project-js/'
						@builder.initialize(@path + 'buddy.json')
						@builder.compile()
					it 'should build 1 js file', ->
						path.existsSync(@builder.jsTargets[0].output).should.be.true
					it 'should contain 2 modules', ->
						contents = fs.readFileSync(@builder.jsTargets[0].output, 'utf8')
						contents.should.include("require.module('main'")
						contents.should.include("require.module('package/class_camel_case'")
				describe 'with a single js file requiring 1 wrapped dependency', ->
					beforeEach ->
						@path = 'compile/project-js/'
						@builder.initialize(@path + 'buddy_wrapped.json')
						@builder.compile()
					it 'should build 1 js file', ->
						path.existsSync(@builder.jsTargets[0].output).should.be.true
					it 'should contain 2 modules', ->
						contents = fs.readFileSync(@builder.jsTargets[0].output, 'utf8')
						contents.should.include("require.module('main_wrapped'")
						contents.should.include("require.module('package/prewrapped'")
				describe 'with a directory of empty js files', ->
					it 'should build 2 js files', ->
						@path = 'compile/project-js/'
						@builder.initialize(@path + 'buddy_empty.json')
						@builder.compile()
						gatherFiles(@builder.jsTargets[0].output).should.have.length(2)

