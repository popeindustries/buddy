# TODO: protect against source folder as out target during watch routine
# TODO: add folder watching to pick up new files (wait for a better node.js implementation)

fs = require('fs')
path = require('path')
Configuration = require('./configuration')
plugins = require('./plugins')
Depedencies = require('./dependencies')
JSFile = require('./jsfile')
CSSFile = require('./cssfile')
JSTarget = require('./jstarget')
CSSTarget = require('./csstarget')
{notify, readdir} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

#starts with '.' or '_', contains '-min.' or '.min.' or 'svn' or '~'
RE_IGNORE_FILE = /^[\._~]|[-\.]min[-\.]|svn$/
JS = 'js'
CSS = 'css'
HTML = 'html'

module.exports = class Builder
	constructor: ->
		@config = null
		@plugins = null
		@dependencies = null
		@watchers = []
		@jsSources =
			locations: []
			byPath: {}
			byModule: {}
			count: 0
		@cssSources =
			locations: []
			byPath: {}
			count: 0
		@htmlSources =
			locations: []
			byPath: {}
			count: 0
		@jsTargets = []
		@cssTargets = []
		@htmlTargets = []

	# Initialize based on configuration located at 'configpath'
	# The directory tree will be walked if no 'configpath' specified
	# @param {String} configpath [file name or directory containing default]
	initialize: (configpath) ->
		unless @initialized
			# Load configuration file and plugins
			@config = new Configuration(configpath)
			@config
				.locate()
				.load()
			# Load and store plugins
			@plugins = plugins.load(@config.settings and @config.settings.plugins)
			# Init dependencies if necessary
			@dependencies = new Depedencies(@config.dependencies, @plugins.js.compressor) if @config.dependencies
			@initialized = true
		return @

	# Install dependencies
	install: ->
		if @dependencies
			notify.print('installing dependencies...', 2)
			@dependencies.install((err) -> err and notify.error(err))
		else
			notify.error('no dependencies specified in configuration file')

	# Build sources based on targets specified in configuration
	# optionally 'compress'ing and 'lint'ing
	# @param {Boolean} compress
	# @param {Boolean} lint
	build: (compress, lint) ->
		[JS, CSS].forEach (type) =>
			if @_validBuildType(type)
				# Generate source cache
				@config.build[type].sources.forEach (source) =>
					@_parseSourceDirectory(path.resolve(process.cwd(), source), null, @[type + 'Sources'])
				# Generate build targets
				@_parseTargets(@config.build[type].targets, type)
				# Run targets
				@[type + 'Targets'].forEach (target) =>
					target.run(compress, lint)

	# Build and compress sources based on targets specified in configuration
	deploy: ->
		@build(true, false)

	# Check that a given 'filename' is a valid source of 'type'
	# including compileable file types
	# @param {String} type
	# @param {String} filename
	_validSource: (type, filename) ->
		extension = path.extname(filename)[1..]
		return true if extension is type
		# Loop through compilers
		for name, compiler of @plugins[type].compilers
			return true if extension is compiler.extension
		return false

	# Check that a given build 'type' is properly described in the target configuration
	# @param {String} type
	_validBuildType: (type) ->
		@config.build[type]?.sources? and @config.build[type].sources.length >= 1 and @config.build[type].targets? and @config.build[type].targets.length >= 1

	# Recursively store all valid source files in a 'cache' from a given 'dir'
	# @param {String} dir
	# @param {String} root [topmost location in recursive seach]
	# @param {Object} cache
	_parseSourceDirectory: (dir, root, cache) ->
		# Store root directory for File module package resolution
		cache.locations.push(root = dir) unless root

		readdir(dir, RE_IGNORE_FILE).forEach (item) =>
			# Store File objects in cache
			if f = @_fileFactory(path.resolve(dir, item), root)
				cache.count++
				cache.byModule[f.moduleId] = f if f.moduleId?
				cache.byPath[f.filepath] = f

	# Generate file instances based on type
	# @param {String} filepath
	# @param {String} base [root of file's source location]
	_fileFactory: (filepath, base) ->
		# Create file instance by type
		if @_validSource(JS, filepath)
			return new JSFile(filepath, base, @plugins[JS].compilers, @plugins[JS].module)
		else if @_validSource(CSS, filepath)
			return new CSSFile(filepath, base, @plugins[CSS].compilers)
		else
			return null

	# Recursively cache all valid target instances specified in configuration
	# @param {Array} targets
	# @param {String} type
	# @param {Target} parentTarget
	_parseTargets: (targets, type, parentTarget = null) ->
		targets.forEach (item) =>
			item.parent = parentTarget
			if target = @_targetFactory(type, item)
				@[type + 'Targets'].push(target)
				# Recurse nested child targets
				@_parseTargets(item.targets, type, target) if item.targets

	# Validate and generate target instances based on type
	# @param {String} type
	# @param {Object} props
	_targetFactory: (type, props) ->
		inputpath = path.resolve(process.cwd(), props.input)
		outputpath = path.resolve(process.cwd(), props.output)

		# Validate target
		# Abort if input doesn't exist
		unless existsSync(inputpath)
			notify.error("#{notify.strong(props.input)} not found in project path", 2)
			return null
		# Check that input exists in sources
		for location in @[type + 'Sources'].locations
			dir = if fs.statSync(inputpath).isDirectory() then inputpath else path.dirname(inputpath)
			inSources = dir.indexOf(location) >= 0
			break if inSources
		# Abort if input doesn't exist in sources
		unless inSources
			notify.error("#{notify.strong(props.input)} not found in source path", 2)
			return null
		# Abort if input is directory and output is file
		if fs.statSync(inputpath).isDirectory() and path.extname(outputpath).length
			notify.error("a file (#{notify.strong(props.output)}) is not a valid output target for a directory (#{notify.strong(props.input)}) input target", 2)
			return null

		# Set options
		options =
			compressor: @plugins[type].compressor
			linter: @plugins[type].linter
		if type is JS
			# Default to modular TRUE
			options.modular = if props.modular? then props.modular else true
			options.module = @plugins.js.module
			options.parent = props.parent
			return new JSTarget(inputpath, outputpath, @[type + 'Sources'], options)
		else if type is CSS
			return new CSSTarget(inputpath, outputpath, @[type + 'Sources'], options)
###
	watch: (compress, lint) ->
		# @build(compress, lint)
		# console.log(@jsSources.count, @cssSources.count)

		# for type in [@JS, @CSS]
		# 	notify.print("watching for changes in #{notify.strong('['+@config.build[type].sources.join(', ')+']')}...", 2)
		# 	for s in @[type + 'Sources'].locations
		# 		watcher = chokidar.watch(s, {ignored: @RE_IGNORE_FILE, persistent: true})
		# 		watcher.on('add', @_onWatchAdd)
		# 		watcher.on('change', @_onWatchChange)
		# 		watcher.on('unlink', @_onWatchUnlink)
		# 		@watchers.push(watcher)

	_onWatchAdd: (filepath) =>
		unless (@jsSources.byPath[filepath] or @cssSources.byPath[filepath]) and not path.basename(filepath).match(RE_IGNORE_FILE)
			# Find base source directory
			for loc in @jsSources.locations.concat(@cssSources.locations)
				# Create file instance and store
				if filepath.indexOf(loc) is 0 and f = @_fileFactory(filepath, loc)
					cache = @[f.type + 'Sources']
					cache.count++
					cache.byModule[f.moduleId] = f if f.moduleId?
					cache.byPath[f.filepath] = f
					console.log('add', filepath, cache.count, path.basename(filepath).match(RE_IGNORE_FILE))
					return
		# notify.print("[#{new Date().toLocaleTimeString()}] change detected in #{notify.strong(path)}", 0)

	_onWatchChange: (filepath) =>
		# notify.print("[#{new Date().toLocaleTimeString()}] change detected in #{notify.strong(path)}", 0)

	_onWatchUnlink: (filepath) =>
		# notify.print("[#{new Date().toLocaleTimeString()}] change detected in #{notify.strong(path)}", 0)

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
					# TODO: re-initialize targets
					@compile(compress, [file.type])
###
