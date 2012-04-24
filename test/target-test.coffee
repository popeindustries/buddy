path = require('path')
Builder = require('../lib/builder')
target = require('../lib/target')

describe 'target', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))

	describe 'Target Class', ->
		describe 'initialize()', ->
			beforeEach ->
				@target = new target.Target(null, path.resolve('js'), {'byPath': []})
			describe 'batch property', ->
				it 'should return true when input is a directory', ->
					@target.input = path.resolve('src')
					@target.initialize()
					@target.batch.should.be.true

	describe 'JSTarget Class', ->
		describe 'initialize()', ->
			beforeEach ->
				@target = new target.JSTarget(null, path.resolve('js'), {'byPath': []})
			describe 'output property', ->
				it 'should resolve to a single .js file when input is file and output is directory', ->
					@target.input = path.resolve('src/package/Class.coffee')
					@target.initialize()
					@target.output.should.equal(path.resolve('js/Class.js'))
			describe 'batch property', ->
				it 'should return true when nodejs property is true', ->
					@target.input = path.resolve('src/main.coffee')
					@target.nodejs = true
					@target.initialize()
					@target.batch.should.be.true
		describe 'parsing input sources', ->
			beforeEach ->
				@builder = new Builder
				@builder.base = '.'
				@builder._parseSourceDirectory('src', null, @builder.jsSources)
				@target = new target.JSTarget(null, path.resolve('js'), @builder.jsSources)
			describe 'with a single input source and no dependencies', ->
				it 'should result in a source count of 1', ->
					@target.input = path.resolve('src/package/Class.coffee')
					@target.initialize()
					@target.sources.should.have.length(1)
				it 'should flag the input source as the main entry point', ->
					@target.input = path.resolve('src/package/Class.coffee')
					@target.initialize()
					@target.sources[0].main.should.be.true
			describe 'with a single input source and 1 dependency', ->
				it 'should result in a source count of 2', ->
					@target.input = path.resolve('src/package/ClassCamelCase.coffee')
					@target.initialize()
					@target.sources.should.have.length(2)
			describe 'with a single input source duplicated in a parent target', ->
				it 'should result in a source count of 0', ->
					t = {}
					t.hasSource = -> true
					@target.parentTarget = t
					@target.input = path.resolve('src/main.coffee')
					@target.initialize()
					@target.sources.should.have.length(0)
			describe 'with a single input source and 2 circular dependencies', ->
				it 'should result in a source count of 3', ->
					@target.input = path.resolve('src/circular/circular.coffee')
					@target.initialize()
					@target.sources.should.have.length(3)
