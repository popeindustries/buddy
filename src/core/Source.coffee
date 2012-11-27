path = require('path')
File = require('./file')
{readdir, existsSync} = require('../utils/utils')

module.exports = class Source

	constructor: (@type, sources) ->
		@byPath: {}
		@byModule: {}
		@length: 0
		@locations = []
		sources.forEach (source) =>
			@locations.push(path.resolve(source))

	parse: (ignore, fn) ->
		outstanding = 0
		@locations.forEach (location) =>
			outstanding++
			readdir location, ignore, (err, files) =>
				outstanding--
				return fn(err) if err
				files.forEach (file) => @add(file)
				return fn() unless outstanding

	add: (file) ->
		@length++
		@byPath[file.filepath] = file
		@byModule[file.moduleId] = file

	remove: (file) ->
		@length--
		delete @byPath[file.filepath]
		delete @byModule[file.moduleId]
		file.destroy()

	watch: (fn) ->

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
