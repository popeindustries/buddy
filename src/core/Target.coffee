fs = require('fs')
path = require('path')
async = require('async')
{readdir, existsSync} = require('../utils/fs')
notify = require('../utils/notify')

#starts with '.', '_', or '~' contains '-min.' or '.min.', is 'svn', or ends with '~'
RE_IGNORE_FILE = /^[\._~]|[-\.]min[-\.]|svn|~$/

module.exports = class Target

	constructor: (@type, @input, @output, @options) ->
		@sources = {}
		# input is file
		if path.extname(@input).length
			# A single file can be 'batched' if not modular
			@batch = not @options.modular
			# Resolve default output file name for file>directory target
			unless path.extname(@output).length
				@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), ".#{@type}")
		# input is directory
		else
			@batch = true

	build: (compress, lint, fn) ->
		# Clear existing
		@sources = {}
		# Parse

	_parse: (fn) ->
		if @batch
			if path.extname(@input).length
				@_readfile @input, (err, content) ->
					return fn(err) if err
					@sources[@input] = content
					fn()
			else
				readdir @input, RE_IGNORE_FILE, (err, files) =>
					return fn(err) if err
					async.map files, @_readfile, (err, contents) =>
						return fn(err) if err
						files.forEach (file, idx) =>
							@sources[file] = contents[idx]
						fn()
		else


	_readfile: (filepath, fn) =>
		fs.readfile filepath, 'utf8', (err, content) ->
			if err then fn(err) else fn(null, content)

###
	# Constructor
	# @param {String} type
	# @param {String} input
	# @param {String} output
	# @param {Object} fileCache
	# @param {Object} options
	constructor: (@type, @input, @output, @fileCache, @options) ->
		@sources = []
		@files = []
		@concat = false
		@watching = false
		# Resolve output file name for file>directory target
		if not path.extname(@output).length and fs.statSync(@input).isFile()
			@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), ".#{@type}")

	# Process the target, optionally compressing and linting output
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Function} fn(err, files)
	run: (compress, lint, fn) ->
		# Clear existing sources
		@sources = []
		@files = []
		# Parse sources and build
		@_parseSources(@input)
		if @sources.length
			notify.print("building #{notify.strong(path.basename(@input))} to #{notify.strong(path.basename(@output))}", 2) unless @watching
			@_build(compress, lint, fn)
		else
			notify.warn("no sources to build in #{notify.strong(@input)}", 2)
			fn()

	# Determine if a File is included in a target's sources
	# @param {File} file
	# @return	{Boolean}
	hasSource: (file) ->
		file in @sources

	# Recursively add File objects from file cache based on 'input' path
	# @param {String} input
	# @param {Function} fn(err)
	_parseSources: (input, fn) ->
		# Add files from source cache
		fs.stat input, (err, stats) =>
			if err
				fn(err)
			else
				if stats.isFile()
					if file = @fileCache.byPath[input]
						file.parseContents(@options.modular)
						@_addSource(file)
				else
					# Recurse child directories
					fs.readdir input, (err, files) =>
						if err
							fn(err)
						else
							files.forEach (file) =>
								@_parseSources(path.join(input, file))

	# Add a File object to the source store if not already added
	# @param {File} file
	_addSource: (file) ->
		@sources.push(file) if file not in @sources

	_lint: (content, filepath) ->
		if @options.linter?
			@options.linter.lint content, (err) =>
				if err
					notify.warn('failed linting', 4)
					err.items.forEach (item) =>
						notify.print("[#{item.line}:#{item.col}] #{item.reason}", 5)
				else
					notify.print("#{notify.colour('passed linting', notify.GREEN)} #{notify.strong(path.basename(filepath))}", 4)

	_compress: (content, filepath, fn) ->
		if @options.compressor?
			@options.compressor.compress content, (err, content) =>
				if err
					fn(err)
				else
					notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.basename(filepath))}", 3)
					fn(null, content)

###