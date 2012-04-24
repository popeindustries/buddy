path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Builder = require('../lib/builder')
target = require('../lib/target')

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
			describe 'file target with a single coffee file', ->
				it 'should build 1 js file', ->
					@path = 'compile/project/'
					@builder.initialize(@path + 'buddy_single-file.json')
					@builder.compile()
					path.existsSync(path.resolve(@path + '/output/Class.js')).should.be.true
			describe 'file target with a single coffee file requiring 1 dependency', ->
				beforeEach ->
					@path = 'compile/project/'
					@output = path.resolve(@path + '/output/ClassCamelCase.js')
					@builder.initialize(@path + 'buddy_single-file-with-dependency.json')
					@builder.compile()
				it 'should build 1 js file', ->
					path.existsSync(@output).should.be.true
				it 'should contain 2 modules', ->
					contents = fs.readFileSync(@output, 'utf8')
					contents.should.include("require.module('package/class'")
					contents.should.include("require.module('package/class_camel_case'")
