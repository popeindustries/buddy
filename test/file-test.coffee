path = require 'path'
assert = require 'assert'
vows = require 'vows'
builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
coffee = require 'coffee-script'

term.silent = true

vows.describe('file/instantiation')
	.addBatch
		'a coffeescript JSFile instance':
			topic: builder._loadConfig path.resolve(__dirname, 'fixtures/project')
			'with relative path of "other/Class.coffee"':
				topic: new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/Class.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'has a module name of "other/class"': (jsFile) ->
					assert.equal jsFile.module, 'other/class'
			'with relative path of "other/ClassCamelCase.coffee"':
				topic: new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/ClassCamelCase.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'has a module name of "other/class_camel_case"': (jsFile) ->
					assert.equal jsFile.module, 'other/class_camel_case'
			'with tabs has a module wrapper':
				topic: ->
					new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/nested/nested.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'that compiles without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.contentsModule, {bare:true})), Error
			'with spaces has a module wrapper':
				topic: ->
					new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/spaces.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'that compiles without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.contentsModule, {bare:true})), Error
	.export(module)
