# TODO: catch write errors?

fs = require('fs')
path = require('path')
{notify} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

module.exports = class Target

	# Constructor
	# @param {String} type
	# @param {String} input
	# @param {String} output
	# @param {Object} fileCache
	# @param {Object} options
	constructor: (@type, @input, @output, @fileCache, @options) ->
		@sources = []
		@concat = false
		# Resolve output file name for file>folder target
		if not path.extname(@output).length and fs.statSync(@input).isFile()
			@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), ".#{@type}")

	# Process the target, optionally compressing and linting output
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Function} fn
	run: (compress, lint, fn) ->
		# Clear existing sources
		@sources = []
		# Parse sources and build
		@_parseSources(@input)
		if @sources.length
			notify.print("building #{notify.strong(path.basename(@input))} to #{notify.strong(path.basename(@output))}", 2)
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
	_parseSources: (input) ->
		# Add files from source cache
		if fs.statSync(input).isFile()
			if file = @fileCache.byPath[input]
				file.parseContents(@options.modular)
				@_addSource(file)
		else
			# Recurse child directories
			fs.readdirSync(input).forEach (item) => @_parseSources(path.join(input, item))

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

