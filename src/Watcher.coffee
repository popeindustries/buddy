fs = require('fs')
path = require('path')
events = require('events')
{readdir, wait} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

module.exports = class Watcher extends events.EventEmitter

	constructor: (@ignore = /^\./) ->
		@watchers = {}

	watch: (source) ->
		unless @ignore.test(path.basename(source))
			stats = fs.statSync(source)
			lastChange = 0
			# recursively parse items in directory
			if stats.isDirectory()
				fs.readdirSync(source).forEach (item) =>
					@watch(path.resolve(source, item))

			# store watcher objects
			@watchers[source] = fs.watch source, (evt, filename) =>
				if existsSync(source)
					stats = fs.statSync(source)
					if stats.isFile()
						# notify if changed
						@emit('change', source, stats) if lastChange is 0 or stats.mtime.getTime() > lastChange
						lastChange = stats.mtime.getTime()
					else if stats.isDirectory()
						# notify if new
						@emit('create', source, stats) unless @watchers[source]
						# check for new files
						fs.readdirSync(source).forEach (item) =>
							item = path.resolve(source, item)
							if not @ignore.test(path.basename(item)) and not @watchers[item]
								@emit('create', item, fs.statSync(item))
								@watch(item)
				else
					@unwatch(source)
					@emit('delete', source)

	unwatch: (source) ->
		if @watchers[source]?
			try
				@watchers[source].close()
			catch err
			delete @watchers[source]

	clean: ->
		@unwatch(source) for source of @watchers
