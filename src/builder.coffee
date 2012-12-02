fs = require('fs')
path = require('path')
async = require('async')
target = require('./core/target')
configuration = require('./core/configuration')
processors = require('./processors')
dependencies = require('./core/dependencies')
Source = require('./core/source')
filelog =require('./utils/filelog')
notify = require('./utils/notify')
{debug, warn, error, print, colour, strong} = require('./utils/notify')
{readdir, rm, existsSync} = require('./utils/fs')

JS = 'js'
CSS = 'css'
HTML = 'html'

start = notify.start = +new Date

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
	# @param {Boolean} verbose
	install: (configpath, verbose) ->
		@_initialize configpath, verbose, (err) =>
			error(err, 0) if err
			if @config.dependencies
				debug('INSTALL', 1)
				print('installing dependencies...', 2)
				dependencies.install @config.dependencies, (err, files) =>
					# Persist file references created on install
					files and filelog.add(files)
					err and error(err, 0)
					print("completed install in #{colour((+new Date - start) / 1000 + 's', notify.CYAN)}", 2)
			else
				error('no dependencies specified in configuration file', 2)

	# Build sources based on targets specified in config
	# optionally 'compress'ing and 'lint'ing
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Boolean} verbose
	# @param {Function} fn(err)
	build: (configpath, @compress, @lint, verbose, fn) ->
		@_initialize configpath, verbose, (err) =>
			error(err, 0) if err
			async.forEachSeries [JS, CSS], ((type, cb) =>
				if build = @config.build[type]
					if @_validBuildType(build)
						# Generate source cache
						debug('SOURCE', 1)
						@sources[type] = new Source(type, build.sources, @processors[type])
						@sources[type].parse (err) =>
							return cb("failed parsing sources #{strong(build)}") if err
							# Generate build targets
							debug('TARGET', 1)
							@_parseTargets type, build.targets, (err, instances) =>
								return cb(err) if err
								@targets[type] = instances
								# Build targets
								debug('BUILD', 1)
								async.forEachSeries @targets[type], ((target, cb2) =>
									@_buildTarget target, compress, lint, (err) =>
										return cb2(err) if err
										cb2()
								), (err) =>
									return cb(err) if err
									cb()
					else
						return cb('invalid build configuration')
				else
					cb()
			), (err) =>
				if err
					fn and fn(err)
					error(err, 2)
				print("completed build in #{colour((+new Date - start) / 1000 + 's', notify.CYAN)}", 2)
				fn and fn()

	# Build sources and watch for creation, changes, and deletion
	# optionally 'compress'ing and 'reload'ing the browser
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} compress
	# @param {Boolean} verbose
	watch: (configpath, @compress, verbose) ->
		@_initialize configpath, verbose, (err) =>
			return error(err, 0) if err
			@build(configpath, @compress, false, verbose)
			@watching = true
			[JS, CSS].forEach (type) =>
				if @[type + 'Sources'].count
					print("watching [#{strong(@config.build[type].sources.join(', '))}]...", 0)
					@[type + 'Sources'].locations.forEach (source) =>
						@watchers.push(watcher = new Watcher(RE_WATCH_IGNORE_FILE))
						watcher.on('create', @_onWatchCreate)
						watcher.on('change', @_onWatchChange)
						watcher.on('delete', @_onWatchDelete)
						watcher.watch(source)

	# Build and compress sources based on targets specified in configuration
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} verbose
	deploy: (configpath, verbose) ->
		@build(configpath, true, false, verbose)

	# List all file system content created via installing and building
	# @param {Boolean} verbose
	list: (verbose) ->
		notify.verbose = verbose
		filelog.load (err) =>
			# List files
			debug('LIST', 1)
			print('listing generated files...', 2)
			filelog.files.forEach (file) ->
				print("#{strong(file)}", 3)

	# Remove all file system content created via installing and building
	# @param {Boolean} verbose
	clean: (verbose) ->
		notify.verbose = verbose
		filelog.load (err) =>
			# Delete files
			debug('CLEAN', 1)
			print('cleaning generated files...', 2)
			filelog.files.forEach (file) ->
				print("#{colour('deleted', notify.RED)} #{strong(file)}", 3)
				rm path.resolve(file), ->
			filelog.clean()

	# Initialize based on configuration located at 'configpath'
	# The directory tree will be walked if no 'configpath' specified
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} verbose
	# @param {Function} fn()
	_initialize: (configpath, verbose, fn) ->
		notify.verbose = verbose
		start = new Date()
		unless @initialized
			# Load configuration file
			configuration.load configpath, (err, data) =>
				return fn(err) if err
				@config = data
				print("loaded config #{strong(configuration.url)}", 2)
				# Load filelog
				filelog.load(->)
				# Load and store processors
				processors.load (@config.settings and @config.settings.processors), (err, installed) =>
					return fn(err) if err
					@processors = installed
					@initialized = true
					fn()
		else
			fn()

	# Check that a given 'build' is properly described in the target configuration
	# @param {String} build
	_validBuildType: (build) =>
		!!(build and build.sources and build.sources.length >= 1 and build.targets and build.targets.length >= 1)

	# Recursively cache all valid target instances specified in configuration
	# @param {String} type
	# @param {Array} targets
	# @param {Function} fn(err, instances)
	_parseTargets: (type, targets, fn) =>
		instances = []
		outstanding = 0
		parse = (targets, parent) =>
			targets.forEach (options) =>
				options.parent = parent
				options.source = @sources[type]
				outstanding++
				target type, options, @processors[type], (err, instance) =>
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
	_buildTarget: (target, compress, lint, fn) =>
		target.build compress, lint, (err, files) =>
			# Persist file references created on build
			files and filelog.add(files)
			return fn(err) if err
			fn()

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
