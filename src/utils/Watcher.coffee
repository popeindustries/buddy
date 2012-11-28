fs = require('fs')
path = require('path')
events = require('events')
{readdir, wait, existsSync} = require('./fs')

module.exports = class Watcher extends events.EventEmitter

	# Constructor
	# @param {RegExp} ignore
	constructor: (@ignore = /^\./) ->
		@watchers = {}

	# Watch a 'source' file or directory for changes
	# @param {String} source
	watch: (source) ->
		unless @ignore.test(path.basename(source))
			fs.stat source, (err, stats) =>
				if err
					@emit('error', err)
				else
					lastChange = stats.mtime.getTime()
					lastSize = stats.size
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
									@emit('error', err)
								else
									if stats.isFile()
										# notify if changed
										if stats.mtime.getTime() isnt lastChange and stats.size isnt lastSize
											@emit('change', source, stats)
										lastChange = stats.mtime.getTime()
									else if stats.isDirectory()
										# notify if new
										@emit('create', source, stats) unless @watchers[source]
										# check for new files
										fs.readdir source, (err, files) =>
											if err
												@emit('error', err)
											else
												files.forEach (file) =>
													item = path.resolve(source, file)
													# new file
													if not @ignore.test(path.basename(item)) and not @watchers[item]
														fs.stat item, (err, stats) =>
															@emit('create', item, stats)
															@watch(item)
						# Deleted
						else
							@unwatch(source)
							@emit('delete', source)

	# Stop watching a 'source' file or directory for changes
	# @param {String} source
	unwatch: (source) ->
		if @watchers[source]?
			try
				@watchers[source].close()
			catch err
			delete @watchers[source]

	# Stop watching all sources for changes
	clean: ->
		@unwatch(source) for source of @watchers
