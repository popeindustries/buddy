# TODO: protect against source folder as out target during watch routine

fs = require 'fs'
path = require 'path'
util = require 'util'
coffee = require 'coffee-script'
stylus = require 'stylus'
# less = require 'less'
uglify = require 'uglify-js'
_ = require 'underscore'
growl = require 'growl'
{log} = console
target = require './target'
file = require './file'
term = require './terminal'

CONFIG = 'build.json'

initialized = false

module.exports = 
	config: null
	base: null
	jsSources:
		byPath: {}
		byName: {}
		byModule: {}
		count: 0
	cssSources:
		byPath: {}
		count: 0
	jsBuilds: null
	cssBuilds: null

	compile: (configuration) ->
		@_initialize(configuration)

	watch: ->

	deploy: ->

	_loadConfig: ->
		# Find the first instance of the CONFIG file based on the current working directory.
		while (true)
			dir = if dir? then path.resolve(dir, '../') else process.cwd()
			configPath = path.join(dir, CONFIG)
			break if path.existsSync(configPath)
			# Exit if we reach the volume root without finding our file
			if dir is '/'
				term.out "#{term.colour('warning', term.RED)} #{term.colour(CONFIG, term.GREY)} not found on this path", 2
				term.out "See #{term.colour('--help', term.GREY)} for more info", 3
				return false
		
		# Read and parse config settings
		term.out "Loading config file #{term.colour(configPath, term.GREY)}", 2
		try
			@config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
		catch e
			term.out "#{term.colour('warning', term.RED)} error parsing #{term.colour(configPath, term.GREY)} file", 2
			return false
		
		# Store the base directory
		@base = dir
		initialized = true
		return initialized
	
	_initializeJSBuilds: ->
		# Prepare js builds
		if @config.js and @config.js.sources and @config.js.sources.length and @config.js.targets and @config.js.targets.length
			# Generate source cache
			@_parseSourceContents(path.resolve(@base, source)) for source in @config.js.sources
			# Generate builds
			# jsBuilds = ((new JSBuild(target.in, target.out, target.nodejs)) for target in config.js.targets)
	
	_parseSourceContents: (dir) ->
		log dir
		for filename in fs.readdirSync dir
			filepath = path.resolve dir, filename
			name = filename.replace(path.extname(filename), '')
			log name, filename, filepath
	# base ||= if dir.charAt(dir.length - 1) isnt '/' then "#{dir}/" else dir
	# for filename in fs.readdirSync dir
	# 	filepath = path.join dir, filename
	# 	name = (filepath.replace(base, '')).replace path.extname(filename), ''
	# 	# JS source file
	# 	if filename.match RE_JS_SRC_EXT
	# 		if name of jsSources.byName
	# 			cache?.push jsSources.byName[name]
	# 		else
	# 			# Parse contents unless it's an ignored file
	# 			contents = fs.readFileSync(filepath, 'utf8') unless filename.match RE_IGNORE
	# 			# Ignore files with 'built' header
	# 			unless contents.match RE_BUILT
	# 				# Escape js contents for the coffeescript compiler
	# 				contents = "`#{contents}`" if filename.match RE_JS_EXT
	# 				# Create and store File object
	# 				file = new JSFile filepath, filename, name, contents, production
	# 				jsSources.byPath[filepath] = file
	# 				jsSources.byName[name] = file
	# 				jsSources.byModule[file.module] = file if file.module
	# 				jsSources.count++
	# 	# CSS source file
	# 	else if filename.match RE_STYLUS_EXT
	# 		if filepath of cssSources.byPath
	# 			cache?.push cssSources.byPath[filepath]
	# 		else
	# 			# Parse contents unless it's an ignored file
	# 			contents = fs.readFileSync(filepath, 'utf8') unless filename.match RE_IGNORE
	# 			# Create and store File object
	# 			file = new CSSFile filepath, filename, name, contents
	# 			cssSources.byPath[filepath] = file
	# 			cssSources.count++
	# 	# Directory
	# 	else if fs.statSync(filepath).isDirectory() and !(filename.match(RE_IGNORE))
	# 		parseSourceContents filepath, base, cache
