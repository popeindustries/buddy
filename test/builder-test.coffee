path = require 'path'
fs = require 'fs'
assert = require 'assert'
vows = require 'vows'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'

term.silent = true

loadConfig = (workingDir, configPath) ->
	process.chdir(workingDir)
	new Builder()._loadConfig(configPath)

clearOutput = (builder) ->
	for type in [builder.JS, builder.CSS]
		for target in builder[type+'Targets']
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
					loadConfig(path.resolve(__dirname, 'fixtures/config'))
				'should return true': (result) ->
					assert.isTrue result
			'from a valid nested working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/config/nested'))
				'should return true': (result) ->
					assert.isTrue result
			'from an invalid working directory':
				topic: ->
					loadConfig(path.resolve(__dirname, '../../'))
				'should return false': (result) ->
					assert.isFalse result
			'with an invalid format':
				topic: ->
					loadConfig(path.resolve(__dirname, 'fixtures/config'), 'build_bad.json')
				'should return false': (result) ->
					assert.isFalse result
			'with a valid file path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/config/build.json')
				'should return true': (result) ->
					assert.isTrue result
			'with a valid directory path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/config')
				'should return true': (result) ->
					assert.isTrue result
			'with an invalid path':
				topic: ->
					loadConfig(path.resolve(__dirname), 'fixtures/config/build_none.json')
				'should return false': (result) ->
					assert.isFalse result
	.export(module)

vows.describe('builder/initialization/source')
	.addBatch
		'parsing a source file':
			'with a valid path':
				topic: ->
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/init/source/src/main.coffee')
				'should return a File instance': (result) ->
					assert.instanceOf result, file.JSFile
			'that has already been built':
				topic: ->
					Builder::_fileFactory path.resolve(__dirname, 'fixtures/init/source/js/main.js')
				'should return "null"': (result) ->
					assert.isNull result
	.addBatch
		'parsing a source directory':
			'containing nested source files':
				topic: ->
					builder = new Builder
					builder._parseSourceFolder path.resolve(__dirname, 'fixtures/init/source/src'), null, builder.jsSources
					builder
				'should increase the source cache size by the number of valid files': (builder) ->
					assert.equal builder.jsSources.count, 4
				'should skip ignored files': (builder) ->
					assert.isUndefined builder.jsSources[path.resolve(__dirname, 'fixtures/init/source/src/_ignored.coffee')]
	.export(module)
	
vows.describe('builder/initialization/target')
	.addBatch
		'parsing a build target':
			topic: ->
				builder = new Builder
				builder.base = path.resolve(__dirname, 'fixtures/init/target')
				builder._parseSourceFolder path.resolve(builder.base, 'src/nested'), null, builder.jsSources
				builder
			'with an input file that is not found on the source path':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/main.coffee', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with an input file that doesn`t exist`':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/nested/main.coffee', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with a directory input and a file output':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/nested', out: 'js/main.js'}
				'should return "null"': (result) ->
					assert.isNull result
			'with a valid input and output':
				topic: (builder) ->
					builder._targetFactory builder.JS, {in: 'src/nested/Class.coffee', out: 'js/Class.js'}
				'should return a Target instance': (result) ->
					assert.instanceOf result, target.JSTarget
	.export(module)

vows.describe('builder/compile')
	.addBatch
		'compiling a file target':
			topic: ->
				process.chdir(path.resolve(__dirname, 'fixtures/compile/project'))
				null
			'with a single coffee file':
				topic: ->
					builder = new Builder
					builder.initialize('build_single-file.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 js file': (builder) ->
					assert.isTrue path.existsSync(path.resolve(process.cwd(), 'js/package/Class.js'))
					clearOutput(builder)
	.addBatch
		'compiling a file target':
			'with a single coffee file requiring 1 dependency':
				topic: ->
					@output = path.resolve(process.cwd(), 'js/package/ClassCamelCase.js')
					builder = new Builder
					builder.initialize('build_single-file-with-dependency.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 js file': (builder) ->
					assert.isTrue path.existsSync(@output)
				'should contain 2 modules': (builder) ->
					contents = fs.readFileSync(@output, 'utf8')
					assert.include contents, "module('package/class'"
					assert.include contents, "module('package/class_camel_case'"
					clearOutput(builder)
	.addBatch
		'compiling a file target':
			'with a single coffee file containing a module wrapper':
				topic: ->
					@output = path.resolve(process.cwd(), 'js/wrapped.js')
					builder = new Builder
					builder.initialize('build_single-file-with-wrapper.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 js file': (builder) ->
					contents = fs.readFileSync(@output, 'utf8')
					match = contents.match /require.module\('wrapped'/gm
					assert.equal match.length, 1
					clearOutput(builder)
	.addBatch
		'compiling a file target':
			'with a single stylus file':
				topic: ->
					builder = new Builder
					builder.initialize('build_single-styl-file.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 css file': (builder) ->
					assert.isTrue path.existsSync(path.resolve(process.cwd(), 'css/main.css'))
					clearOutput(builder)
	.addBatch
		'compiling a file target':
			'with a single less file':
				topic: ->
					builder = new Builder
					builder.initialize('build_single-less-file.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 css file': (builder) ->
					assert.isTrue path.existsSync(path.resolve(process.cwd(), 'css/main.css'))
					clearOutput(builder)
	.addBatch
		'compiling a folder target':
			topic: ->
				process.chdir(path.resolve(__dirname, 'fixtures/compile/library'))
				null
			'containing 3 coffee files':
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
		'compiling a folder target':
			'containing 3 coffee files and the "nodejs" flag set':
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
	.addBatch
		'compiling a folder target':
			'containing 2 stylus files':
				topic: ->
					builder = new Builder
					builder.initialize('build_styl.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 2 css files': (builder) ->
					assert.equal gatherFiles(builder.cssTargets[0].output).length, 2
					clearOutput(builder)
	.addBatch
		'compiling a project':
			topic: ->
				process.chdir(path.resolve(__dirname, 'fixtures/compile/project'))
				null
			'with a single coffee file and a stylus folder':
				topic: ->
					builder = new Builder
					builder.initialize('build.json')
					clearOutput(builder)
					builder.compile()
					builder
				'should build 1 concatenated js file': (builder) ->
					assert.isTrue path.existsSync(path.resolve(process.cwd(), 'js/main.js'))
				'should build 2 css files': (builder) ->
					assert.equal gatherFiles(builder.cssTargets[0].output).length, 2
					clearOutput(builder)
	.export(module)