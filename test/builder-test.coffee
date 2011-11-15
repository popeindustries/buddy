path = require 'path'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'

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
			'from valid working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/project'))
				'returns true': (result) ->
					assert.isTrue result
			'from valid nested working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/project/src/coffee'))
				'returns true': (result) ->
					assert.isTrue result
			'from invalid working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, '../../'))
				'returns false': (result) ->
					assert.isFalse result
			'with invalid format':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/bad-json'))
				'returns false': (result) ->
					assert.isFalse result
			'with valid file path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/project/build.json')
				'returns true': (result) ->
					assert.isTrue result
			'with valid directory path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/project')
				'returns true': (result) ->
					assert.isTrue result
			'with invalid path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/js/build.json')
				'returns false': (result) ->
					assert.isFalse result
	.export(module)

vows.describe('builder/initialization')
	.addBatch
		'parsing a source file':
			'with valid path':
				topic: ->
					@coffeFile = path.resolve(__dirname, 'fixtures/project/src/coffee/main.coffee')
					Builder::_fileFactory @coffeFile
				'returns a File instance': (result) ->
					assert.instanceOf result, file.JSFile
				'with the correct filename': (result) ->
					assert.equal @coffeFile, result.filepath
			'that has been built':
				topic: ->
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/project/js/main.js')
				'is ignored and returns nothing': (result) ->
					assert.isNull result
	.addBatch
		'parsing a source directory':
			'containing nested source files':
				topic: ->
					builder = new Builder
					@length = builder.jsSources.count
					builder._parseSourceFolder path.resolve(__dirname, 'fixtures/project/src/coffee'), null, builder.jsSources
					builder
				'increases the source cache size by the number of valid files': (builder) ->
					assert.equal builder.jsSources.count - @length, 5
				'skips ignored files': (builder) ->
					assert.isUndefined builder.jsSources[path.resolve(__dirname, 'fixtures/project/src/coffee/ignored/_ignored.coffee')]
	.export(module)