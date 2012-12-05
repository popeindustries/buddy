path = require('path')
file = require('./file')
Watcher = require('../utils/watcher')
notify = require('../utils/notify')
{debug, strong, print, colour} = require('../utils/notify')
{indir, readdir, existsSync, ignored} = require('../utils/fs')

module.exports = class Source

	# Constructor
	# @param {String} type
	# @param {Array} sources
	# @param {Object} processors
	constructor: (@type, sources, @processors) ->
		debug("created #{type} Source instance for: #{strong(sources)}", 2)
		@_watchers = []
		@byPath = {}
		@byModule = {}
		@length = 0
		@locations = []
		sources.forEach (source) =>
			@locations.push(path.resolve(source))

	# Parse sources, generating File instances for valid files
	# @param {Function} fn(err)
	parse: (fn) ->
		outstanding = 0
		@locations.forEach (location) =>
			outstanding++
			readdir location, ignored, (err, files) =>
				outstanding--
				return fn(err) if err
				files.forEach (f) => @add(f)
				unless outstanding
					return fn()

	# Add a File instance to the cache by 'filepath'
	# @param {String} filepath
	add: (filepath) ->
		filepath = path.resolve(filepath)
		basepath = @_getBasepath(filepath)
		if not @byPath[filepath] and basepath
			# Create File instance
			file @type, filepath, basepath, @processors, (err, instance) =>
				# Notify?
				return if err
				@length++
				@byPath[instance.filepath] = instance
				@byModule[instance.moduleID] = instance

	# Remove a File instance from the cache by 'filepath'
	# @param {String} filepath
	remove: (filepath) ->
		filepath = path.resolve(filepath)
		if f = @byPath[filepath]
			debug("removed source: #{strong(path.relative(process.cwd(), filepath))}", 3)
			@length--
			delete @byPath[filepath]
			delete @byModule[file.moduleID]
			f.destroy()

	# Watch for changes and call 'fn'
	# @param {Function} fn(err, file)
	watch: (fn) ->
		@locations.forEach (location) =>
			print("watching #{strong(path.relative(process.cwd(), location))}...", 3)
			@_watchers.push(watcher = new Watcher(ignored))
			# Add file on 'create'
			watcher.on 'create', (filepath, stats) =>
				@add(filepath)
				print("[#{new Date().toLocaleTimeString()}] #{colour('added', notify.GREEN)} #{strong(path.relative(process.cwd(), filepath))}", 3)
			# Remove file on 'delete'
			watcher.on 'delete', (filepath) =>
				@remove(filepath)
				print("[#{new Date().toLocaleTimeString()}] #{colour('removed', notify.RED)} #{strong(path.relative(process.cwd(), filepath))}", 3)
			# Notify when 'change'
			# Return File instance
			watcher.on 'change', (filepath, stats) =>
				print("[#{new Date().toLocaleTimeString()}] #{colour('changed', notify.YELLOW)} #{strong(path.relative(process.cwd(), filepath))}", 3)
				file = @byPath[filepath]
				file.content = ''
				fn(null, file)
			# Notify when 'error'
			watcher.on 'error', (err) =>
				fn(err)
			# Watch
			watcher.watch(location)

	# Get base path for 'filepath'
	# @param {String} filepath
	_getBasepath: (filepath) ->
		for location in @locations
			return location if indir(location, filepath)
		return null
