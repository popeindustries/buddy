path = require 'path'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'

# term.silent = true

loadConfig = (workingDir, configPath) ->
	process.chdir(workingDir)
	new Builder()._loadConfig(configPath)

vows.describe('builder/matching')
	.addBatch
		'a file':
			'is a JS file':
				'if it ends in ".js"': ->
					assert.match 'test.js', Builder::RE_JS_SRC_EXT
				'if it ends in ".coffee"': ->
					assert.match 'test.coffee', Builder::RE_JS_SRC_EXT
			'is a CSS file':
				'if it ends in ".styl"': ->
					assert.match 'test.styl', Builder::RE_CSS_SRC_EXT
				'if it ends in ".less"': ->
					assert.match 'test.less', Builder::RE_CSS_SRC_EXT
			'is ignored':
				'if it`s name starts with "_"': ->
					assert.match '_test.js', Builder::RE_IGNORE_FILE
				'if it`s name starts with "."': ->
					assert.match '.test.js', Builder::RE_IGNORE_FILE
				'if it`s name contains "-min"': ->
					assert.match 'test-min.js', Builder::RE_IGNORE_FILE
				'if it`s name contains ".min"': ->
					assert.match 'test.min.js', Builder::RE_IGNORE_FILE
				'if it`s contents include a BUILT header': ->
					assert.match '/*BUILT Tue Nov 01 2011 13:50:57 GMT+0100 (CET)*/', Builder::RE_BUILT_HEADER
	.export(module)

vows.describe('builder/configuration')
	.addBatch
		'loading config JSON file':
			'from a valid working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/project'))
				'should return true': (result) ->
					assert.isTrue result
			'from a valid nested working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/project/src/coffee'))
				'should return true': (result) ->
					assert.isTrue result
			'from an invalid working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, '../../'))
				'should return false': (result) ->
					assert.isFalse result
			'with a invalid format':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/bad-json'))
				'should return false': (result) ->
					assert.isFalse result
			'with a valid file path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/project/build.json')
				'should return true': (result) ->
					assert.isTrue result
			'with a valid directory path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/project')
				'should return true': (result) ->
					assert.isTrue result
			'with an invalid path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/js/build.json')
				'should return false': (result) ->
					assert.isFalse result
	.export(module)

vows.describe('builder/initialization/source')
	.addBatch
		'parsing a source file':
			'with a valid path':
				topic: ->
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/project/src/coffee/main.coffee')
				'should return a File instance': (result) ->
					assert.instanceOf result, file.JSFile
			'that has already been built':
				topic: ->
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/project/js/main.js')
				'should return "null"': (result) ->
					assert.isNull result
	.addBatch
		'parsing a source directory':
			'containing nested source files':
				topic: ->
					builder = new Builder
					builder._parseSourceFolder path.resolve(__dirname, 'fixtures/project/src/coffee'), null, builder.jsSources
					builder
				'should increase the source cache size by the number of valid files': (builder) ->
					assert.equal builder.jsSources.count, 5
				'should skip ignored files': (builder) ->
					assert.isUndefined builder.jsSources[path.resolve(__dirname, 'fixtures/project/src/coffee/ignored/_ignored.coffee')]
	.export(module)
	
vows.describe('builder/initialization/target')
	.addBatch
		'parsing a build target':
			topic: ->
				builder = new Builder
				builder.base = path.resolve(__dirname, 'fixtures/project')
				builder._parseSourceFolder path.resolve(builder.base, 'src/coffee/other'), null, builder.jsSources
				builder
			'with an input file that is not found on the source path':
				topic: (builder) ->
					builder._targetFactory 'src/coffee/main.coffee', 'js/main.js', builder.JS
				'should return "null"': (result) ->
					assert.isNull result
			'with an input file that doesn`t exist`':
				topic: (builder) ->
					builder._targetFactory 'src/coffee/other/main.coffee', 'js/main.js', builder.JS
				'should return "null"': (result) ->
					assert.isNull result
			'with a directory input and a file output':
				topic: (builder) ->
					builder._targetFactory 'src/coffee/other', 'js/main.js', builder.JS
				'should return "null"': (result) ->
					assert.isNull result
			'with a valid input and output':
				topic: (builder) ->
					builder._targetFactory 'src/coffee/other/Class.coffee', 'js/Class.js', builder.JS
				'should return a Target instance': (result) ->
					assert.instanceOf result, target.JSTarget
	.export(module)