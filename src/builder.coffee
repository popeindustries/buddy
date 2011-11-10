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

config = null
initialized = false

exports.compile = (configPath) ->
	initialize(configPath)

exports.watch = ->

exports.deploy = ->

initialize = (configPath) ->
	if path.existsSync configPath
		term.out "Loading config file #{term.colour(configPath, term.GREY)}", 2
		# Read and parse config settings
		config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
		# Prepare js builds
		if config.js and config.js.sources and config.js.targets
			# Generate source cache
			parseSourceContents(source) for source in config.js.sources
			# Generate builds
			# jsBuilds = ((new JSBuild(target.in, target.out, target.nodejs)) for target in config.js.targets)
	else
		term.out "#{term.colour('warning', term.RED)} missing #{term.colour(configPath, term.GREY)} file.", 2

parseSourceContents = (dir, base, cache = null) ->
	base ||= if dir.charAt(dir.length - 1) isnt '/' then "#{dir}/" else dir
	for filename in fs.readdirSync dir
		filepath = path.join dir, filename
		name = (filepath.replace(base, '')).replace path.extname(filename), ''
		# JS source file
		if filename.match RE_JS_SRC_EXT
			if name of jsSources.byName
				cache?.push jsSources.byName[name]
			else
				# Parse contents unless it's an ignored file
				contents = fs.readFileSync(filepath, 'utf8') unless filename.match RE_IGNORE
				# Ignore files with 'built' header
				unless contents.match RE_BUILT
					# Escape js contents for the coffeescript compiler
					contents = "`#{contents}`" if filename.match RE_JS_EXT
					# Create and store File object
					file = new JSFile filepath, filename, name, contents, production
					jsSources.byPath[filepath] = file
					jsSources.byName[name] = file
					jsSources.byModule[file.module] = file if file.module
					jsSources.count++
		# CSS source file
		else if filename.match RE_STYLUS_EXT
			if filepath of cssSources.byPath
				cache?.push cssSources.byPath[filepath]
			else
				# Parse contents unless it's an ignored file
				contents = fs.readFileSync(filepath, 'utf8') unless filename.match RE_IGNORE
				# Create and store File object
				file = new CSSFile filepath, filename, name, contents
				cssSources.byPath[filepath] = file
				cssSources.count++
		# Directory
		else if fs.statSync(filepath).isDirectory() and !(filename.match(RE_IGNORE))
			parseSourceContents filepath, base, cache
