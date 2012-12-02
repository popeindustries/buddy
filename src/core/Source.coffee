path = require('path')
file = require('./file')
{indir, readdir, existsSync, ignored} = require('../utils/fs')
{debug, strong} = require('../utils/notify')

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
		debug("added source: #{strong(path.relative(process.cwd(), filepath))}", 3)
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
		debug("removed source: #{strong(path.relative(process.cwd(), filepath))}", 3)
		filepath = path.resolve(filepath)
		if f = @byPath[filepath]
			@length--
			delete @byPath[filepath]
			delete @byModule[file.moduleID]
			f.destroy()

	# Watch for changes and call 'fn'
	# @param {Function} fn(err, changed)
	watch: (fn) ->

	# Get base path for 'filepath'
	# @param {String} filepath
	_getBasepath: (filepath) ->
		for location in @locations
			return location if indir(location, filepath)
		return null

	# Respond to 'create' event during watch
	# @param {String} filename
	# @param {Stats} stats
	_onWatchCreate: (filename, stats) =>
		type = @_getFileType(filename)
		if type and file = @_fileFactory(filename, @_getSourceLocation(filename, type))
			print("[#{new Date().toLocaleTimeString()}] #{colour('added', GREEN)} #{strong(path.basename(filename))}", 3)
			@_cacheFile(file, @[type + 'Sources'])

	# Respond to 'change' event during watch
	# @param {String} filename
	# @param {Stats} stats
	_onWatchChange: (filename, stats) =>
		print("[#{new Date().toLocaleTimeString()}] #{colour('changed', YELLOW)} #{strong(path.basename(filename))}", 3)
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
			print("[#{new Date().toLocaleTimeString()}] #{colour('removed', RED)} #{strong(path.basename(filename))}", 3)
			@_uncacheFile(file, @[type + 'Sources'])
