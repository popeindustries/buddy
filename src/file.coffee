fs = require('fs')
path = require('path')

RE_BUILT_HEADER = /^\/\*BUILT/g

module.exports = class File

	# Constructor
	# @param {String} type
	# @param {String} filepath
	# @param {String} basepath [root source location]
	# @param {Object} compilers
	constructor: (@type, @filepath, basepath, compilers) ->
		@filename = path.basename(@filepath)
		@extension = path.extname(@filename)[1..]
		@dependencies = []
		# qualified base name, with path from source root
		@qualifiedFilename = path.relative(basepath, @filepath).replace(path.extname(@filename), '')
		@needsCompile = @extension isnt @type
		@_contents = ''
		# Find and store compiler
		if @needsCompile
			for id, compiler of compilers
				if @extension is compiler.extension
					@compiler = compiler
					break

	# Read file contents
	parseContents: ->
		# Clear existing
		@_contents = ''
		# Read file
		contents = fs.readFileSync(@filepath, 'utf8')
		# Skip compiled files
		return if contents.match(RE_BUILT_HEADER)
		@_contents = contents

	# Return contents, compiled if necessary
	# @param {Object} options
	# @param {Function} fn
	getContents: (options, fn) ->
		# Compile if necessary
		if @needsCompile then @_compile(options, fn) else fn(null, @_contents)

	destroy: ->
		@dependencies = null
		@compiler = null

	# Use the supplied compiler to compile file contents
	# @param {Object} options
	# @param {Function} fn
	_compile: (options, fn) ->
		if @compiler?
			@compiler.compile @_contents, options.sources, (err, compiled) =>
				if err then fn(err, '') else fn(null, compiled)
		else
			fn("no compiler plugin available for #{nofify.strong(@filename)}", '')
