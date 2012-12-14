fs = require('fs')
path = require('path')
events = require('events')
{readdir, wait, existsSync} = require('./fs')

THROTTLE_TIMEOUT = 100

module.exports = class Watcher extends events.EventEmitter

	# Constructor
	# @param {RegExp} ignore
	constructor: (@ignore = /^\./) ->
		@watchers = {}
		@_throttling =
			create: false
			'delete': false
			change: false

	# Watch a 'source' file or directory for changes
	# @param {String} source
	watch: (source) ->
		unless @ignore.test(path.basename(source))
			fs.stat source, (err, stats) =>
				if err
					@emit('error', err)
				else
					lastChange = stats.mtime.getTime()
					# recursively parse items in directory
					if stats.isDirectory()
						fs.readdir source, (err, files) =>
							if err
								@emit('error', err)
							else
								files.forEach (file) =>
									@watch(path.resolve(source, file))

					# store watcher objects
					@watchers[source] = fs.watch source, (evt, filename) =>
						if existsSync(source)
							fs.stat source, (err, stats) =>
								if err
									@_throttleEvent('error', err)
								else
									if stats.isFile()
										# notify if changed
										if stats.mtime.getTime() isnt lastChange
											@_throttleEvent('change', source, stats)
										lastChange = stats.mtime.getTime()
									else if stats.isDirectory()
										# notify if new
										unless @watchers[source]
											@_throttleEvent('create', source, stats)
										# check for new files
										fs.readdir source, (err, files) =>
											if err
												@_throttleEvent('error', err)
											else
												files.forEach (file) =>
													item = path.resolve(source, file)
													# new file
													if not @ignore.test(path.basename(item)) and not @watchers[item]
														fs.stat item, (err, stats) =>
															@_throttleEvent('create', item, stats)
															@watch(item)
						# Deleted
						else
							@unwatch(source)
							@_throttleEvent('delete', source)

	# Stop watching a 'source' file or directory for changes
	# @param {String} source
	unwatch: (source) ->
		if watcher = @watchers[source]
			delete @watchers[source]
			try
				watcher.close()
			catch err

	# Stop watching all sources for changes
	clean: ->
		@unwatch(source) for source of @watchers

	# Protect against mutiple event emits
	# @param {String} type
	_throttleEvent: (type, props...) ->
		unless @_throttling[type]
			@_throttling[type] = true
			@emit.apply(@, [type].concat(props))
			setTimeout((=> @_throttling[type] = false), THROTTLE_TIMEOUT)
