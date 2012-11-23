fs = require('fs')
path = require('path')
Configuration = require('./configuration')
plugins = require('./plugins')
Depedencies = require('./dependencies')
Watcher = require('./watcher')
Filelog =require('./filelog')
JSFile = require('./jsfile')
CSSFile = require('./cssfile')
JSTarget = require('./jstarget')
CSSTarget = require('./csstarget')
{notify, readdir, rm, existsSync} = require('./utils')

#starts with '.', '_', or '~' contains '-min.' or '.min.' or 'svn'
RE_IGNORE_FILE = /^[\._~]|[-\.]min[-\.]|svn|~$/
#starts with '.', or '~' contains '-min.' or '.min.' or 'svn'
RE_WATCH_IGNORE_FILE = /^[\.~]|[-\.]min[-\.]|svn|~$/
JS = 'js'
CSS = 'css'
HTML = 'html'

module.exports = class Builder

	# Constructor
	constructor: ->
		@config = null
		@plugins = null
		@dependencies = null
		@filelog = null
		@compress = false
		@lint = false
		@watching = false
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
			# Init filelog
			@filelog = new Filelog
			@initialized = true
		return @

	# Install dependencies
	install: ->
		if @dependencies
			notify.print('installing dependencies...', 2)
			@dependencies.install (err, files) =>
				# Persist file references created on install
				files and @filelog.add(files)
				err and notify.error(err, 2)
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
					@_parseSourceDirectory(path.resolve(source), null, @[type + 'Sources'])
				# Generate build targets
				@_parseTargets(@config.build[type].targets, type)
				# Run targets
				@[type + 'Targets'].forEach (target) => @_runTarget(target, compress, lint)

	# Build sources and watch for creation, changes, and deletion
	# optionally 'compress'ing and 'reload' the browser
	# @param {Boolean} compress
	watch: (@compress) ->
		@build(@compress, false)
		@watching = true
		[JS, CSS].forEach (type) =>
			if @[type + 'Sources'].count
				notify.print("watching [#{notify.strong(@config.build[type].sources.join(', '))}]...", 2)
				@[type + 'Sources'].locations.forEach (source) =>
					@watchers.push(watcher = new Watcher(RE_WATCH_IGNORE_FILE))
					watcher.on('create', @_onWatchCreate)
					watcher.on('change', @_onWatchChange)
					watcher.on('delete', @_onWatchDelete)
					watcher.watch(source)

	# Build and compress sources based on targets specified in configuration
	deploy: ->
		@build(true, false)

	# Remove all file system content created via installing and building
	clean: ->
		# Delete files
		if @filelog.files.length
			notify.print('cleaning files...', 2)
			@filelog.files.forEach (file) ->
				notify.print("#{notify.colour('deleted', notify.RED)} #{notify.strong(file)}", 3)
				rm(path.resolve(file))
			@filelog.clean()
		else
			notify.print('no files to clean', 2)

	# Check that a given 'filename' is a valid source of 'type'
	# including compileable file types
	# @param {String} type
	# @param {String} filename
	_validFileType: (type, filename) ->
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

	# Retrieve the file type for a given 'filename'
	# @param {String} filename
	# @return {String}
	_getFileType: (filename) ->
		extension = path.extname(filename)[1..]
		for type in [JS, CSS]
			return type if extension is type
			# Loop through compilers
			for name, compiler of @plugins[type].compilers
				return type if extension is compiler.extension
		return ''

	# Retrieve the source location for the given 'filename' and source 'type'
	# @param {String} filename
	# @param {String} type
	# @return {String}
	_getSourceLocation: (filename, type) ->
		for source in @[type + 'Sources'].locations
			return source if filename.indexOf(source) isnt -1
		return ''

	# Recursively store all valid source files in a 'cache' from a given 'dir'
	# @param {String} dir
	# @param {String} root [topmost location in recursive seach]
	# @param {Object} cache
	_parseSourceDirectory: (dir, root, cache) ->
		# Store root directory for File module package resolution
		cache.locations.push(root = dir) unless root

		readdir(dir, RE_IGNORE_FILE).forEach (item) =>
			# Store File objects in cache
			@_cacheFile(file, cache) if file = @_fileFactory(path.resolve(dir, item), root)

	# Generate file instances based on type
	# @param {String} filepath
	# @param {String} base [root of file's source location]
	_fileFactory: (filepath, base) ->
		# Create file instance by type
		if @_validFileType(JS, filepath)
			return new JSFile(filepath, base, @plugins[JS].compilers, @plugins[JS].module)
		else if @_validFileType(CSS, filepath)
			return new CSSFile(filepath, base, @plugins[CSS].compilers)
		else
			return null

	# Store 'file' objects in 'cache'
	# @param {File} file
	# @param {Object} cache
	_cacheFile: (file, cache) ->
		unless cache.byPath[file.filepath]
			cache.count++
			cache.byModule[file.moduleId] = file if cache.byModule
			cache.byPath[file.filepath] = file

	# Remove 'file' object from 'cache'
	# @param {File} file
	# @param {Object} cache
	_uncacheFile: (file, cache) ->
		cache.count--
		delete cache.byModule[file.moduleId] if file.moduleId
		delete cache.byPath[file.filepath]
		file.destroy()

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
		inputpath = path.resolve(props.input)
		outputpath = path.resolve(props.output)

		# Validate target
		# Abort if input doesn't exist
		unless existsSync(inputpath)
			notify.error("#{notify.strong(props.input)} not found in project path", 2)
			return null
		# TODO: async stat
		isDir = fs.statSync(inputpath).isDirectory()
		# Check that input exists in sources
		for location in @[type + 'Sources'].locations
			dir = if isDir then inputpath else path.dirname(inputpath)
			inSources = dir.indexOf(location) >= 0
			break if inSources
		# Abort if input doesn't exist in sources
		unless inSources
			notify.error("#{notify.strong(props.input)} not found in source path", 2)
			return null
		# Abort if input is directory and output is file
		if isDir and path.extname(outputpath).length
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

	# Run the given 'target'
	# @param {Target} target
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Function} fn
	_runTarget: (target, compress, lint, fn) ->
		target.run compress, lint, (err, files) =>
			# Persist file references created on build
			files and @filelog.add(files)
			# Callback
			fn and fn(files)
			err and notify.error(err, 2)

	# Respond to 'create' event during watch
	# @param {String} filename
	# @param {Stats} stats
	_onWatchCreate: (filename, stats) =>
		type = @_getFileType(filename)
		if type and file = @_fileFactory(filename, @_getSourceLocation(filename, type))
			notify.print("[#{new Date().toLocaleTimeString()}] #{notify.colour('added', notify.GREEN)} #{notify.strong(path.basename(filename))}", 3)
			@_cacheFile(file, @[type + 'Sources'])

	# Respond to 'change' event during watch
	# @param {String} filename
	# @param {Stats} stats
	_onWatchChange: (filename, stats) =>
		notify.print("[#{new Date().toLocaleTimeString()}] #{notify.colour('changed', notify.YELLOW)} #{notify.strong(path.basename(filename))}", 3)
		type = @_getFileType(filename)
		@[type + 'Targets'].forEach (target) =>
			target.watching = true
			@_runTarget target, @compress, false

	# Respond to 'delete' event during watch
	# @param {String} filename
	# @param {Stats} stats
	_onWatchDelete: (filename) =>
		type = @_getFileType(filename)
		if type and file = @[type + 'Sources'].byPath[filename]
			notify.print("[#{new Date().toLocaleTimeString()}] #{notify.colour('removed', notify.RED)} #{notify.strong(path.basename(filename))}", 3)
			@_uncacheFile(file, @[type + 'Sources'])
