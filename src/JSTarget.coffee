fs = require('fs')
path = require('path')
{notify, mkdir, indent} = require('./utils')
Target = require('./target')

BUILT_HEADER = '/*BUILT '
RE_HELPER_METHODS = /^(\s+)(__\w*)\s=\s(.+)(,|;)$/gm

module.exports = class JSTarget extends Target

	# Constructor
	# @param {String} input
	# @param {String} output
	# @param {Object} fileCache
	# @param {Object} options
	constructor: (input, output, fileCache, options) ->
		super('js', input, output, fileCache, options)
		# Concat output if using modules and input is a file
		@concat = @options.modular and fs.statSync(@input).isFile()

	# Add a File object to the source store
	# Recursively adds dependant files
	# @param {File} file
	# @param {File} dependantFile
	_addSource: (file, dependantFile) ->
		# If this target has a parent, make sure we don't duplicate sources
		return if @options.parent?.hasSource(file)
		# First add dependencies
		if file.dependencies.length
			file.dependencies.forEach (dependency) =>
				# Guard against circular dependency
				if dependantFile?.moduleId isnt dependency
					if dep = @fileCache.byModule[dependency] or @fileCache.byModule["#{dependency}/index"]
						dep.parseContents(@options.modular)
						# Recursively add dependency
						# Pass reference to current file for circular check
						@_addSource(dep, file)
					else
						notify.warn("dependency #{notify.strong(dependency)} for #{notify.strong(file.moduleId)} not found", 4)
		# Store
		super(file)

	# Generate output, optionally compressing and linting
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Function} fn(err, files)
	_build: (compress, lint, fn) ->
		opts = {}
		opts.modular = @options.modular
		# Single file
		if @concat
			contents = []
			@sources.forEach (file) =>
				file.getContents opts, (err, content) =>
					# Error compiling
					if err
						fn(err)
					else
						contents.push(content)
						# Concat and write when all content received
						if contents.length is @sources.length
							# Concat
							content = contents.join('\n')
							# Optimize and wrap in IIFE
							content = @_wrapContent(@_optimizeContent(content))
							# Lint
							@_lint(content, @output) if lint
							# Compress
							if compress
								@_compress content, @output, (err, content) =>
									# Error compressing
									if err
										fn(err)
									else
										# Output to file
										@_writeFile(content, @output, true, fn, true)
							else
								# Output to file
								@_writeFile(content, @output, true, fn, true)
		# Batch files
		else
			n = @sources.length
			@sources.forEach (file, idx) =>
				# Resolve output name for directories
				filepath = if path.extname(@output).length then @output else path.join(@output, file.qualifiedFilename) + '.js'
				file.getContents opts, (err, content) =>
					# Error compiling
					if err
						fn(err)
					else
						# Lint
						@_lint(content, filepath) if lint
						# Compress
						if compress
							@_compress content, filepath, (err, content) =>
								# Error compressing
								if err
									fn(err)
								else
									# No header in this case since no concatenation
									@_writeFile(content, filepath, false, fn, idx + 1 is n)
						else
							# No header in this case since no concatenation
							@_writeFile(content, filepath, false, fn, idx + 1 is n)

	# CoffeeScript boilerplate code optimization
	# Hoists duplicate functions
	# TODO: find a more generic way to do this
	# @param {String} content
	_optimizeContent: (content) ->
		# Replace and store all common expressions ('__bind', etc)
		snippets = {}
		replaceSnippet = (str, p1, p2, p3, p4) ->
			snippets[p2] = p3.replace('__', '___')
			"#{p1}#{p2} = _#{p2}#{p4}"
		content = content.replace(RE_HELPER_METHODS, replaceSnippet)
		# Hoist
		"""
		#{(('var _' + snippet + ' = ' + expr) for snippet, expr of snippets).join(';\n')};
		#{content}
		"""

	# Wraps content in IIFE
	# @param {String} content
	_wrapContent: (content) ->
		"""
		(function () {
		#{indent(content, 2)}
		}).call(this);
		"""

	# Write file 'contents' to the specified 'filepath' location, with an optional header
	# @param {String} content
	# @param {String} filepath
	# @param {Boolean} withHeader
	# @param {Function} fn(err, files)
	# @param {Boolean} exit
	_writeFile: (content, filepath, withHeader, fn, exit) ->
		# Create directory if missing
		mkdir(filepath)
		content = "#{BUILT_HEADER}#{new Date().toString()}*/\n#{content}" if withHeader
		fs.writeFileSync(filepath, content, 'utf8')
		@files.push(filepath)
		notify.print("#{notify.colour('built', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), filepath))}", 3)
		fn(null, @files) if exit
