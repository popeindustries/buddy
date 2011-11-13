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
	RE_JS_SRC_EXT: /\.coffee|\.js$/
	RE_CSS_SRC_EXT: /\.styl|\.less$/
	RE_IGNORE_FILE: /^[_|\.]|[-|\.]min\./
	RE_BUILT_HEADER: /^\/\*BUILT/g
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

	compile: (configPath) ->
		@_initialize(configPath)

	watch: ->

	deploy: ->

	_initialize: (configPath) ->
		unless initialized
			# Load configuration file
			if @_loadConfig(configPath)
				if @config.js and @config.js.sources and @config.js.sources.length and @config.js.targets and @config.js.targets.length
					# Generate source cache
					@_parseSourceFolder(path.resolve(@base, source)) for source in @config.js.sources
					# Generate builds
					# jsBuilds = ((new JSBuild(target.in, target.out, target.nodejs)) for target in config.js.targets)
				if @config.css and @config.css.sources and @config.css.sources.length and @config.css.targets and @config.css.targets.length
					# Generate source cache
					@_parseSourceFolder(path.resolve(@base, source)) for source in @config.css.sources
					# Generate builds
					# jsBuilds = ((new JSBuild(target.in, target.out, target.nodejs)) for target in config.js.targets)
			
		initialized = true
	
	_loadConfig: (configPath) ->
		if configPath
			# Check that the path is valid
			configPath = path.resolve configPath
			unless path.existsSync configPath
				term.out "#{term.colour('warning', term.RED)} #{term.colour(path.basename(configPath), term.GREY)} not found in #{term.colour(path.dirname(configPath), term.GREY)}", 2
				return false
		else
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
		@base = path.dirname configPath
		return true
	
	_parseSourceFolder: (dir) ->
		for item in fs.readdirSync dir
			unless item.match @RE_IGNORE_FILE
				itempath = path.resolve dir, item
				# Recurse child directory
				@_parseSourceFolder(itempath) if fs.statSync(itempath).isDirectory()
				
				if f = @_fileFactory(itempath)
					# JS source file
					if f instanceof file.JSFile
						@jsSources.byPath[f.filepath] = f
						# jsSources.byName[f.name] = f
						# jsSources.byModule[f.module] = f if f.module
						@jsSources.count++
					# CSS source file
					else
						@cssSource.byPath[f.filepath] = f
						@cssSource.count++
	
	_fileFactory: (filepath) ->
		# Create JS file instance
		if filepath.match @RE_JS_SRC_EXT
			# Skip compiled files
			contents = fs.readFileSync(filepath, 'utf8')
			return null if contents.match @RE_BUILT_HEADER
			# Create and store File object
			return new file.JSFile filepath, contents
			
		# Create CSS file instance
		else if filepath.match @RE_CSS_SRC_EXT
			return new file.CSSFile filepath
		
		else return null
	