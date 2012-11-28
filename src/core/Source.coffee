path = require('path')
File = require('./file')
{indir, readdir, existsSync} = require('../utils/fs')

#starts with '.', '_', or '~' contains '-min.' or '.min.' or 'svn'
RE_IGNORE_FILE = /^[\._~]|[-\.]min[-\.]|svn|~$/

module.exports = class Source

	# Constructor
	# @param {String} type
	# @param {Array} sources
	# @param {Object} processors
	constructor: (@type, sources, @processors) ->
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
			readdir location, RE_IGNORE_FILE, (err, files) =>
				outstanding--
				return fn(err) if err
				files.forEach (file) => @add(file)
				return fn() unless outstanding

	# Add a File instance to the cache by 'filepath'
	# @param {String} filepath
	add: (filepath) ->
		filepath = path.resolve(filepath)
		if not @byPath[filepath] and file = @_fileFactory(filepath)
			@length++
			@byPath[file.filepath] = file
			@byModule[file.moduleId] = file

	# Remove a File instance from the cache by 'filepath'
	# @param {String} filepath
	remove: (filepath) ->
		filepath = path.resolve(filepath)
		if file = @byPath[filepath]
			@length--
			delete @byPath[filepath]
			delete @byModule[file.moduleId]
			file.destroy()

	# Watch for changes and call 'fn'
	# @param {Function} fn(err, changed)
	watch: (fn) ->

	# Check that a given 'filename' is a valid source
	# including compileable file types
	# @param {String} filepath
	_validFileType: (filepath) ->
		extension = path.extname(filepath)[1..]
		return true if extension is @type
		# Loop through compilers
		for name, compiler of @processors.compilers
			return true if extension is compiler.extension
		return false

	# Generate file instances based on type
	# @param {String} filepath
	_fileFactory: (filepath) ->
		# Create file instance by type
		if @_validFileType(filepath)
			for location in @locations
				if indir(location, filepath)
					base = location
					break
			return new File(@type, filepath, base, @processors) if base
		else
			return null

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
