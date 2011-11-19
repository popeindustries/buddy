path = require 'path'
fs = require 'fs'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'
{log} = console

term.silent = true

loadConfig = (workingDir, configPath) ->
	process.chdir(workingDir)
	new Builder()._loadConfig(configPath)

clearOutput = (builder) ->
	for target in builder.jsTargets
		if path.existsSync(target.output)
			if fs.statSync(target.output).isFile()
				fs.unlinkSync(target.output)
			else
				fs.unlinkSync(file) for file in gatherFiles(target.output)

gatherFiles = (dir, files) ->
	files ||= []
	for item in fs.readdirSync(dir)
		p = path.resolve(dir, item)
		if fs.statSync(p).isFile()
			files.push(p)
		else
			gatherFiles(p, files)
	files

	
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
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/main.js')
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
					assert.equal builder.jsSources.count, 6
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
					builder._targetFactory builder.JS, {in: 'src/coffee/main.coffee', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with an input file that doesn`t exist`':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/coffee/other/main.coffee', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with a directory input and a file output':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/coffee/other', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with a valid input and output':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/coffee/other/Class.coffee', out: 'js/Class.js'}
				'should return a Target instance': (result) ->
					assert.instanceOf result, target.JSTarget
	.export(module)
	
vows.describe('builder/compile')
	.addBatch
		'compiling a project target':
			topic: ->
				process.chdir(path.resolve(__dirname, 'fixtures/project'))
				null
			'with a single file':
				topic: ->
					builder = new Builder
					builder.initialize('build_single-file.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 file': (builder) ->
					assert.isTrue path.existsSync(path.resolve(process.cwd(), 'js/other/Class.js'))
					clearOutput(builder)
	.addBatch
		'compiling a project target':
			'with a single file requiring 1 dependency':
				topic: ->
					@output = path.resolve(process.cwd(), 'js/other/ClassCamelCase.js')
					builder = new Builder
					builder.initialize('build_single-file-with-dependency.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 file': (builder) ->
					assert.isTrue path.existsSync(@output)
				'should contain 2 modules': (builder) ->
					contents = fs.readFileSync(@output, 'utf8')
					assert.include contents, "module('other/class'"
					assert.include contents, "module('other/class_camel_case'"
					clearOutput(builder)
	.addBatch
		'compiling a project target':
			'with a single file containing a module wrapper':
				topic: ->
					@output = path.resolve(process.cwd(), 'js/wrapped.js')
					builder = new Builder
					builder.initialize('build_single-file-with-wrapper.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should not wrap the built file': (builder) ->
					contents = fs.readFileSync(@output, 'utf8')
					match = contents.match /require.module\('wrapped'/gm
					assert.equal match.length, 1
					clearOutput(builder)
	.addBatch
		'compiling a library target':
			topic: ->
				process.chdir(path.resolve(__dirname, 'fixtures/library'))
				null
			'with a folder containing 3 files':
				topic: ->
					builder = new Builder
					builder.initialize('build.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 3 files': (builder) ->
					assert.equal gatherFiles(builder.jsTargets[0].output).length, 3
					clearOutput(builder)
	.addBatch
		'compiling a library target':
			'with the "nodejs" flag set':
				topic: ->
					builder = new Builder
					builder.initialize('build-nodejs.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 3 files without module wrappers': (builder) ->
					files = gatherFiles(builder.jsTargets[0].output)
					for file in files
						assert.isTrue fs.readFileSync(file, 'utf8').indexOf('require.modules') is -1
					clearOutput(builder)
	.export(module)