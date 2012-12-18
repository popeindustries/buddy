fs = require('fs')
path = require('path')
exec = require('child_process').exec
async = require('async')
target = require('./core/target')
configuration = require('./core/configuration')
processors = require('./processors')
dependencies = require('./core/dependencies')
Source = require('./core/source')
filelog =require('./utils/filelog')
notify = require('./utils/notify')
object = require('./utils/object')
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
		@options =
			compress: false
			compile: false
			lint: false
			test: false
			lazy: false
			reload: false
			verbose: false
			watching: false
			processors: null
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
		object.extend(@options, {verbose})
		@_initialize configpath, (err) =>
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
	# @param {Boolean} test
	# @param {Boolean} lazy
	# @param {Boolean} verbose
	# @param {Function} fn(err)
	build: (configpath, compress, lint, test, lazy, verbose, fn) ->
		object.extend(@options, {compress, lint, test, lazy, verbose})
		@_initialize configpath, (err) =>
			error(err, 2) if err
			async.forEachSeries [JS, CSS], ((type, cb) =>
				if build = @config.build[type]
					if @_validBuildType(build)
						# Generate source cache
						debug('SOURCE', 1)
						opts = object.clone(@options)
						opts.processors = @options.processors[type]
						@sources[type] = new Source(type, build.sources, opts)
						@sources[type].parse (err) =>
							return cb("failed parsing sources #{strong(build)}") if err
							# Generate build targets
							debug('TARGET', 1)
							@_parseTargets type, build.targets, (err, instances) =>
								# Parse errors shouldn't throw
								if instances
									@targets[type] = instances
									# Build targets
									@_buildTargets type, (err) =>
										return cb(err) if err
										cb()
								else
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
				# Run test script
				if @options.test and script = @config.settings.test
					@_executeScript (script, err) ->
						return error(err, 2) if err

	# Build sources and watch for creation, changes, and deletion
	# optionally 'compress'ing and 'reload'ing the browser
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} compress
	# @param {Boolean} reload
	# @param {Boolean} test
	# @param {Boolean} lazy
	# @param {Boolean} verbose
	watch: (configpath, compress, reload, test, lazy, verbose) ->
		@build configpath, compress, false, test, lazy, verbose, (err) =>
			error(err, 2) if err
			debug('WATCH', 1)
			print('watching sources:', 2)
			[@sources.js, @sources.css].forEach (source) =>
				if source
					object.extend(source.options, {watching: true, reload})
					source.watch (err, file) =>
						# Watch error, don't throw
						if err
							error(err, 2, false)
						else
							start = new Date()
							# Clear content
							file.clearContent()
							@_buildTargets source.type, (err) =>
								# Build error, don't throw
								if err
									error(err, 2, false)
								else
									print("completed build in #{colour((+new Date - start) / 1000 + 's', notify.CYAN)}", 3)
									# Run test script
									if @options.test and script = @config.settings.test
										@_executeScript (script, err) ->
											return error(err, 2) if err

	# Build and compress sources based on targets specified in configuration
	# @param {String} configpath [file name or directory containing default]
	# @param {Boolean} test
	# @param {Boolean} lazy
	# @param {Boolean} verbose
	deploy: (configpath, test, lazy, verbose) ->
		@build(configpath, true, false, test, lazy, verbose)

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
	_initialize: (configpath, fn) ->
		notify.verbose = @options.verbose
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
					@options.processors = installed
					@initialized = true
					fn()
				# Register for uncaught errors and clean up
				process.on 'uncaughtException', (err) =>
					dependencies.clean()
					[@sources.js, @sources.css].forEach (source) =>
						source.clean() if source
					# Ring bell
					console.log('\x07') if @options.watching
					throw err
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
		parse = (tgts, parent) =>
			tgts.forEach (tgt) =>
				# Create unique options object
				opts = object.extend(object.clone(@options), tgt)
				opts.parent = parent
				opts.hasParent = !!parent
				opts.hasChildren = !!opts.targets
				opts.source = @sources[type]
				opts.processors = opts.processors[type]
				# CSS targets are compiled at the target level because of @import inlining
				opts.compile = type is CSS
				outstanding++
				target type, opts, (err, instance) =>
					outstanding--
					# Parse errors shouldn't throw
					warn(err, 2) if err
					if instance
						# Insert after parent
						if opts.parent then instances.splice(instances.indexOf(opts.parent)+1, 0, instance) else instances.push(instance)
						parse(opts.targets, instance) if opts.targets
					return fn(null, instances) unless outstanding
		parse(targets)

	# Run all targets for a given 'type'
	# @param {String} type
	# @param {Function} fn(err)
	_buildTargets: (type, fn) =>
		debug('BUILD', 1)
		async.forEachSeries @targets[type], ((tgt, cb) =>
			tgt.build (err, files) =>
				# Persist file references created on build
				files and filelog.add(files)
				# Reset unless target has children
				tgt.reset() unless tgt.options.hasChildren
				# Return error
				return cb(err) if err
				# Reload
				tgt.options.source.refresh(path.basename(files[0]))
				cb()
		), (err) =>
			return fn(err) if err
			fn()

	# Run the script defined in config 'test'
	# @param {String} script
	# @param {Function} fn(err)
	_executeScript: (script, fn) =>
		print('executing test script...', 2)
		debug("execute: #{strong(@config.settings.test)}", 3)
		exec script, (err, stdout, stderr) ->
			return fn(err) if err
			stdout and console.log(stdout)
			stderr and console.log(stderr)
			fn()
