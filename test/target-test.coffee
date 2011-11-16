path = require 'path'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
file = require '../lib/file'
target = require '../lib/target'

vows.describe('target/instantiation')
	.addBatch
		'a JSTarget instance':
			topic: ->
				builder = new Builder
				builder.base = path.resolve(__dirname, 'fixtures/project')
				builder._parseSourceFolder path.resolve(builder.base, 'src/coffee/other'), null, builder.jsSources
				builder
			'with a single input file and no dependencies':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/project/src/coffee/other/Class.coffee'), path.resolve(__dirname, 'fixtures/project/js/other/Class.js'), builder.jsSources
				'should have a source lenth of 1': (target) ->
					assert.equal target.sources.length, 1
			'with a single input file and 1 dependency':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/project/src/coffee/other/ClassCamelCase.coffee'), path.resolve(__dirname, 'fixtures/project/js/other/ClassCamelCase.js'), builder.jsSources
				'should have a source lenth of 2': (target) ->
					assert.equal target.sources.length, 2
			'with an input file and output folder':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/project/src/coffee/other/Class.coffee'), path.resolve(__dirname, 'fixtures/project/js'), builder.jsSources
				'should output to a resolved file name based on the input file name': (target) ->
					assert.isTrue target.output.indexOf('Class.js') isnt -1
	.export(module)
