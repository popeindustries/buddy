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
				builder.base = path.resolve(__dirname, 'fixtures/target')
				builder._parseSourceFolder path.resolve(builder.base, 'src/package'), null, builder.jsSources
				builder
			'with a single input file and no dependencies':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/target/src/package/Class.coffee'), path.resolve(__dirname, 'fixtures/target/js/package/Class.js'), builder.jsSources
				'should have a source lenth of 1': (target) ->
					assert.equal target.sources.length, 1
			'with a single input file and 1 dependency':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/target/src/package/ClassCamelCase.coffee'), path.resolve(__dirname, 'fixtures/target/js/package/ClassCamelCase.js'), builder.jsSources
				'should have a source lenth of 2': (target) ->
					assert.equal target.sources.length, 2
			'with an input file and output folder':
				topic: (builder) ->
					new target.JSTarget path.resolve(__dirname, 'fixtures/target/src/package/Class.coffee'), path.resolve(__dirname, 'fixtures/target/js'), builder.jsSources
				'should output to a resolved file name based on the input file name': (target) ->
					assert.isTrue target.output.indexOf('Class.js') isnt -1
	.export(module)
