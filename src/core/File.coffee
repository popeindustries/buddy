fs = require('fs')
path = require('path')
async = require('async')
{existsSync} = require('../utils/fs')

RE_BUILT_HEADER = /^\/\*BUILT/g

module.exports = class File

	constructor: (@type, @filepath, @options) ->
		@dependencies = []
		@name = path.basename(@filepath)
		# qualified name, with path from base source directory
		for source in @options.sources
			if source.indexOf(@filepath) isnt -1
				@base = source
				@qualifiedName = path.relative(@base, @filepath).replace(path.extname(@name), '')
				break
		@extension = path.extname(@name)[1..]
		@needsCompile = extension isnt @type
		if @needsCompile
			for id, compiler of @options.processors.compilers
				if @extension is compiler.extension
					@compiler = compiler
					break
		@linter = @options.processors.linter
		@compressor = @options.processors.compressor
		@module = @options.processors.module
		@moduleId = @module?.getModuleId(@qualifiedName)

	getContent: (fn) ->
		fs.readfile @filepath, 'utf8', (err, content) ->
			return fn(err) if err
			if @options.modular
				@dependencies = @module.getModuleDependencies(content, @moduleId)
				@dependencies.forEach (dependency, idx) =>


			if @needsCompile
				if @compiler?
					@compiler.compile content, (err, compiled) =>
						return fn(err, '') if err
						if @options.modular
							fn(null, @module.wrapModuleContents(compiled, @moduleId), @dependencies)
						else
							fn(null, compiled)
				else
					fn(null, '')

	destroy: ->

###

	# Read file contents
	# @param {Function} fn(err, data)
	parseContents: (fn) ->
		# Clear existing
		@_contents = ''
		# TODO: read stream and abort on header match
		# Read file
		fs.readFile @filepath, 'utf8', (err, data) =>
			return fn(err) if err
			# Skip compiled files
			return if data.match(RE_BUILT_HEADER)
			@_contents = data
			return fn(null, @_contents)

	# Return contents, compiled if necessary
	# @param {Object} options
	# @param {Function} fn(err, data)
	getContents: (options, fn) ->
		# Compile if necessary
		if @needsCompile then @_compile(options, fn) else fn(null, @_contents)

	destroy: ->
		@dependencies = null
		@compiler = null

	# Use the supplied compiler to compile file contents
	# @param {Object} options
	# @param {Function} fn(err, data)
	_compile: (options, fn) ->
		if @compiler?
			@compiler.compile @_contents, options.sources, (err, compiled) =>
				if err then fn(err, '') else fn(null, compiled)
		else
			fn("no compiler plugin available for #{nofify.strong(@filename)}", '')
###