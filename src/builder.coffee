fs = require('fs')
path = require('path')
target = require('./core/target')
configuration = require('./core/configuration')
processors = require('./processors')
dependencies = require('./core/dependencies')
filelog =require('./utils/filelog')
notify = require('./utils/notify')
{readdir, rm, existsSync} = require('./utils/fs')

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
		@processors = null
		@dependencies = null
		@filelog = null
		@compress = false
		@lint = false
		@watching = false
		@sources =
			js: null
			css: null
			html: null
		@targets =
			js: []
			css: []
			html: []

	# Install dependencies as specified in config file found at 'configpath'
	# @param {String} configpath [file name or directory containing default]
	install: (configpath) ->
		@_initialize configpath, (err) =>
			return notify.error(err, 2) if err
			if @config.dependencies
				notify.print('installing dependencies...', 2)
				dependencies.install (err, files) =>
					# Persist file references created on install
					files and @filelog.add(files)
					err and notify.error(err, 2)
			else
				notify.error('no dependencies specified in configuration file')

	# Build sources based on targets specified in configuration
	# optionally 'compress'ing and 'lint'ing
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} compress
	# @param {Boolean} lint
	build: (configpath, compress, lint) ->
		@_initialize configpath, (err) =>
			return notify.error(err, 2) if err
			[JS, CSS].forEach (type) =>
				if @_validBuildType(build = @config.build[type])
					# Generate source cache
					@sources[type] = new Source(type, build, @processors)
					@sources[type].parse (err) =>
						return notify.error("failed parsing sources #{notify.strong(build)}", 2) if err
						# Generate build targets
						@_parseTargets type, build.targets, (err, instances) =>
							return notify.error(err, 2) if err
							@targets[type] = instances
							# Run targets
							# @[type + 'Targets'].forEach (target) => @_runTarget(target, compress, lint)
				else
					return notify.error('invalid build configuration', 2)

	# Build sources and watch for creation, changes, and deletion
	# optionally 'compress'ing and 'reload'ing the browser
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} compress
	watch: (configpath, @compress) ->
		@_initialize configpath, (err) =>
			return notify.error(err, 2) if err
			@build(configpath, @compress, false)
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
	# @param {String} configpath [file name or directory containing default]
	deploy: (configpath) ->
		@build(configpath, true, false)

	# Remove all file system content created via installing and building
	clean: ->
		# Delete files
		if filelog.files.length
			notify.print('cleaning files...', 2)
			filelog.files.forEach (file) ->
				notify.print("#{notify.colour('deleted', notify.RED)} #{notify.strong(file)}", 3)
				rm(path.resolve(file))
			filelog.clean()
		else
			notify.print('no files to clean', 2)

	# Initialize based on configuration located at 'configpath'
	# The directory tree will be walked if no 'configpath' specified
	# @param {String} configpath [file name or directory containing default]
	# @param {Function} fn()
	_initialize: (configpath, fn) ->
		unless @initialized
			# Load configuration file
			configuration.load configpath, (err, data) ->
				return fn(err) if err
				@config = data
				notify.print("loaded config #{notify.strong(@url)}", 2)
				# Load and store processors
				processors.load (@config.settings and @config.settings.processors), (err, installed) =>
					return fn(err) if err
					@processors = installed
					@initialized = true
					fn()
		else fn()

	# Check that a given 'build' is properly described in the target configuration
	# @param {String} build
	_validBuildType: (build) ->
		!!(build.sources and build.sources.length >= 1 and build.targets and build.targets.length >= 1)

	# Recursively cache all valid target instances specified in configuration
	# @param {String} type
	# @param {Array} targets
	# @param {Function} fn(err, instances)
	_parseTargets: (type, targets, fn) ->
		instances = []
		outstanding = 0
		parse = (targets, parent) =>
			targets.forEach (options) =>
				options.parent = parent
				options.source = @sources[type]
				outstanding++
				target type, options, (err, instance) =>
					outstanding--
					return fn(err) if err
					instances.push(instance)
					parse(options.targets, instance) if options.targets
					return fn(null, instances) unless outstanding
		parse(targets)

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

	# Retrieve the file type for a given 'filename'
	# @param {String} filename
	# @return {String}
	# _getFileType: (filename) ->
	# 	extension = path.extname(filename)[1..]
	# 	for type in [JS, CSS]
	# 		return type if extension is type
	# 		# Loop through compilers
	# 		for name, compiler of @plugins[type].compilers
	# 			return type if extension is compiler.extension
	# 	return ''

	# Retrieve the source location for the given 'filename' and source 'type'
	# @param {String} filename
	# @param {String} type
	# @return {String}
	# _getSourceLocation: (filename, type) ->
	# 	for source in @[type + 'Sources'].locations
	# 		return source if filename.indexOf(source) isnt -1
	# 	return ''
