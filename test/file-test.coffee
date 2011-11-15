path = require 'path'
assert = require 'assert'
vows = require 'vows'
builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
coffee = require 'coffee-script'

term.silent = true

vows.describe('file/matching')
	.addBatch
		'JS file content':
			topic: ->
				@contents =
					'''
					module = require 'module'
						indented line
							another indented line
							a nested require('another_module')
					'''
			'with significant tabbed whitespace':
				'should have an indent type of "tab"': (contents) ->
					assert.equal contents.match(file.JSFile::RE_INDENT)[1], '\t'
			'with require statements':
				topic: () ->
					modules = []
					while match = file.JSFile::RE_REQUIRE.exec @contents
						modules.push match[1]
					modules
				'should match the correct number of statements': (modules) ->
					assert.equal modules.length, 2
				'should match the correct module names': (modules) ->
					assert.include modules, 'module'
					assert.include modules, 'another_module'
				
	.export(module)

vows.describe('file/instantiation')
	.addBatch
		'a coffeescript JSFile instance':
			topic: builder._loadConfig path.resolve(__dirname, 'fixtures/project')
			'with relative path of "other/Class.coffee"':
				topic: new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/Class.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'should have a module name of "other/class"': (jsFile) ->
					assert.equal jsFile.module, 'other/class'
			'with relative path of "other/ClassCamelCase.coffee"':
				topic: new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/ClassCamelCase.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'should have a module name of "other/class_camel_case"': (jsFile) ->
					assert.equal jsFile.module, 'other/class_camel_case'
			'with tabs has a module wrapper':
				topic: ->
					new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/nested/nested.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'that should compile without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.contentsModule, {bare:true})), Error
			'with spaces has a module wrapper':
				topic: ->
					new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/other/spaces.coffee'), path.resolve(__dirname, 'fixtures/project/src/coffee')
				'that should compile without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.contentsModule, {bare:true})), Error
	.export(module)
