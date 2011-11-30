path = require 'path'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
file = require '../lib/file'
coffee = require 'coffee-script'

vows.describe('file/matching')
	.addBatch
		'JSFile':
			'content':
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
						assert.equal contents.match(file.JSFile::RE_INDENT_WHITESPACE)[1], '\t'
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
			topic: Builder::_loadConfig path.resolve(__dirname, 'fixtures/file')
			'with relative path of "package/Class.coffee"':
				topic: new file.JSFile Builder::JS, path.resolve(__dirname, 'fixtures/file/src/package/Class.coffee'), path.resolve(__dirname, 'fixtures/file/src')
				'should have a module name of "package/class"': (jsFile) ->
					assert.equal jsFile.module, 'package/class'
			'with relative path of "package/ClassCamelCase.coffee"':
				topic: new file.JSFile Builder::JS, path.resolve(__dirname, 'fixtures/file/src/package/ClassCamelCase.coffee'), path.resolve(__dirname, 'fixtures/file/src')
				'should have a module name of "package/class_camel_case"': (jsFile) ->
					assert.equal jsFile.module, 'package/class_camel_case'
			'with tabs has a module wrapper':
				topic: ->
					new file.JSFile Builder::JS, path.resolve(__dirname, 'fixtures/file/src/package/Class.coffee'), path.resolve(__dirname, 'fixtures/file/src')
				'that should compile without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.wrap(jsFile.contents, false))), Error
			'with spaces has a module wrapper':
				topic: ->
					new file.JSFile Builder::JS, path.resolve(__dirname, 'fixtures/file/src/package/spaces.coffee'), path.resolve(__dirname, 'fixtures/project/src')
				'that should compile without error': (jsFile) ->
					assert.doesNotThrow (-> coffee.compile(jsFile.wrap(jsFile.contents, false))), Error
	.export(module)
