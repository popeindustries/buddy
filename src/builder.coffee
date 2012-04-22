# TODO: protect against source folder as out target during watch routine
# TODO: add version checking if present in config?
# TODO: add folder watching to pick up new files (wait for a better node.js implementation)

fs = require 'fs'
path = require 'path'
{log, trace} = console
target = require './target'
file = require './file'
term = require './terminal'

CONFIG = 'buddy.json'

module.exports = class Builder
	JS: 'js'
	CSS: 'css'
	RE_JS_SRC_EXT: /\.coffee$|\.js$/
	RE_CSS_SRC_EXT: /\.styl$|\.less$/
	#starts with '.' or '_', contains '-min.' or '.min.', contains 'svn', contains '~'
	RE_IGNORE_FILE: /^[\.|_]|[-|\.]min\.|svn|~$/
	RE_BUILT_HEADER: /^\/\*BUILT/g
	# 'c:\\' or 'c:\' or '/'
	RE_ROOT: /^[a-zA-Z]\:\\\\?$|^\/$/

	constructor: (version) ->
		@config = null
		@base = null
		@watching = false
		@jsSources =
			locations: []
			byPath: {}
			byModule: {}
			count: 0
		@cssSources =
			locations: []
			byPath: {}
			count: 0
		@jsTargets = []
		@cssTargets = []

	initialize: (configpath) ->
		unless @initialized
			# Load configuration file
			if @_loadConfig(@_locateConfig(configpath))
				for type in [@JS, @CSS]
					if @_validBuildType(type)
						# Generate source cache
						@_parseSourceDirectory(path.resolve(@base, source), null, @[type + 'Sources']) for source in @config[type].sources
						# Generate build targets
						@_parseTargets(@config[type].targets, type)
				@initialized = true
		return @

	compile: (compress, types = [@JS, @CSS]) ->
		for type in types
			if @[type + 'Targets'].length
				t.run(compress, @watching) for t in @[type + 'Targets']

	watch: (compress) ->
		return unless fs.watch
		@watching = true
		@compile(compress)
		for type in [@JS, @CSS]
			if @[type + 'Sources'].count
				term.out("watching for changes in #{term.colour('['+@config[type].sources.join(', ')+']', term.GREY)}...", 2)
				@_watchFile(file, compress) for path, file of @[type + 'Sources'].byPath

	deploy: ->
		@compile(true)

	# Locate the config file
	# Walks the directory tree if no file/directory specified
	_locateConfig: (configpath) ->
		if configpath
			# Check that the supplied path is valid
			configpath = path.resolve(configpath)
			if exists = path.existsSync(configpath)
				# Try default file name if passed directory
				if fs.statSync(configpath).isDirectory()
					configpath = path.join(configpath, CONFIG)
					exists = path.existsSync(configpath)
			unless exists
				term.out("#{term.colour('error', term.RED)} #{term.colour(path.basename(configpath), term.GREY)} not found in #{term.colour(path.dirname(configpath), term.GREY)}", 2)
				return null
		else
			# Find the first instance of a CONFIG file based on the current working directory.
			while true
				dir = if dir? then path.resolve(dir, '../') else process.cwd()
				configpath = path.join(dir, CONFIG)
				break if path.existsSync(configpath)
				# Exit if we reach the volume root without finding our file
				if @RE_ROOT.test(dir)
					term.out("#{term.colour('error', term.RED)} #{term.colour(CONFIG, term.GREY)} not found on this path", 2)
					return null
		configpath

	# Load and parse config file
	_loadConfig: (configpath) ->
		if configpath
			# Read and parse config settings
			term.out("loading config #{term.colour(configpath, term.GREY)}", 2)
			try
				@config = JSON.parse(fs.readFileSync(configpath, 'utf8'))
			catch e
				term.out("#{term.colour('error', term.RED)} error parsing #{term.colour(configpath, term.GREY)}", 2)
				return false
			# Store the base directory
			@base = path.dirname(configpath)
			return true
		else
			return false

	# Check that a given build type is properly described in the config settings
	_validBuildType: (type) ->
		@config[type]?.sources? and @config[type].sources.length >= 1 and @config[type].targets? and @config[type].targets.length >= 1

	_parseSourceDirectory: (dir, root, cache) ->
		if root is null
			# Store root directory for File module package resolution
			root = dir
			cache.locations.push(dir)
		for item in fs.readdirSync(dir)
			# Skip ignored files
			unless item.match(@RE_IGNORE_FILE)
				itempath = path.resolve(dir, item)
				# Recurse child directory
				@_parseSourceDirectory(itempath, root, cache) if fs.statSync(itempath).isDirectory()

				# Store File objects in cache
				if f = @_fileFactory(itempath, root)
					cache.byPath[f.filepath] = f
					cache.byModule[f.module] = f if f.module?
					cache.count++

	_fileFactory: (filepath, base) ->
		# Create JS file instance
		if filepath.match(@RE_JS_SRC_EXT)
			# Skip compiled files
			contents = fs.readFileSync(filepath, 'utf8')
			return null if contents.match(@RE_BUILT_HEADER)
			# Create and store File object
			return new file.JSFile(@JS, filepath, base, contents)

		# Create CSS file instance
		else if filepath.match(@RE_CSS_SRC_EXT)
			return new file.CSSFile(@CSS, filepath, base)

		else return null

	_parseTargets: (targets, type, parentTarget = null) ->
		for item in targets
			item.parent = parentTarget
			if t = @_targetFactory(type, item)
				@[type + 'Targets'].push(t)
				# Recurse nested child targets
				@_parseTargets(item.targets, type, t) if item.targets

	_targetFactory: (type, options) ->
		inputpath = path.resolve(@base, options.in)
		outputpath = path.resolve(@base, options.out)
		# Abort if input doesn't exist
		unless path.existsSync(inputpath)
			term.out("#{term.colour('error', term.RED)} #{term.colour(options.in, term.GREY)} not found in project path", 2)
			return null
		# Check that input exists in sources
		for location in @[type + 'Sources'].locations
			dir = if fs.statSync(inputpath).isDirectory() then inputpath else path.dirname(inputpath)
			inSources = dir.indexOf(location) >= 0
			break if inSources
		# Abort if input doesn't exist in sources
		unless inSources
			term.out("#{term.colour('error', term.RED)} #{term.colour(options.in, term.GREY)} not found in source path", 2)
			return null
		# Abort if input is directory and output is file
		if fs.statSync(inputpath).isDirectory() and path.extname(outputpath).length
			term.out("#{term.colour('error', term.RED)} a file (#{term.colour(options.out, term.GREY)}) is not a valid output target for a directory (#{term.colour(options.in, term.GREY)}) input target", 2)
			return null
		return new target[type.toUpperCase() + 'Target'](inputpath, outputpath, @[type + 'Sources'], options.nodejs, options.parent)

	_watchFile: (file, compress) ->
		# Store initial time and size
		stat = fs.statSync(file.filepath)
		file.lastChange = +stat.mtime
		file.lastSize = stat.size
		watcher = fs.watch file.filepath, callback = (event) =>
			# Clear old and create new on rename
			if event is 'rename'
				watcher.close()
				try	 # if source no longer exists, never mind
					watcher = fs.watch(file.filepath, callback)
			if event is 'change'
				# Compare time to the last second
				# This should prevent double watch execusion bug
				nstat = fs.statSync(file.filepath)
				last = +nstat.mtime / 1000
				if last isnt file.lastChange
					# Store new time
					file.lastChange = last
					term.out("[#{new Date().toLocaleTimeString()}] change detected in #{term.colour(file.filename, term.GREY)}", 0)
					# Update contents
					file.updateContents(fs.readFileSync(file.filepath, 'utf8'))
					@compile(compress, [file.type])

