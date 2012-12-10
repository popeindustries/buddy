fs = require('fs')
path = require('path')
async = require('async')
notify = require('../utils/notify')
{debug, strong, colour, print, warn} = require('../utils/notify')
{indir, readdir, mkdir, existsSync, ignored} = require('../utils/fs')

BUILT_HEADER = '/*BUILT '

# Target instance factory
# @param {String} type
# @param {Object} options
# @param {Function} fn(err, instance)
module.exports = (type, options, fn) ->
	inputpath = path.resolve(options.input)
	outputpath = path.resolve(options.output)
	# Validate target
	# Abort if input doesn't exist
	return fn("#{strong(options.input)} doesn\'t exist") unless existsSync(inputpath)
	fs.stat inputpath, (err, stats) ->
		return fn(err) if err
		isDir = stats.isDirectory()
		# Check that input exists in sources
		for location in options.source.locations
			valid = indir(location, inputpath)
			if valid
				break
		# Abort if input doesn't exist in sources
		unless valid
			return fn("#{strong(options.input)} not found in source path")
		# Abort if input is directory and output is file
		if isDir and path.extname(outputpath).length
			return fn("a file (#{strong(options.output)}) is not a valid output target for a directory (#{strong(options.input)}) input target")
		# Override options
		options.modular ?= true
		options.compressor = options.processors.compressor if options.compress
		options.linter = options.processors.linter if options.lint
		return fn(null, new Target(type, isDir, options))

# Target class
class Target

	# Constructor
	# @param {String} type
	# @param {Boolean} isDir
	# @param {Object} options
	constructor: (@type, @isDir, @options) ->
		debug("created #{@type} Target instance with input: #{strong(@options.input)} and output: #{strong(@options.output)}", 2)
		@input = path.resolve(@options.input)
		@output = path.resolve(@options.output)
		@sources = []
		@files = []
		# Track all modified files so we can reset when complete
		@_modified = []
		# input is file
		unless @isDir
			# A single file can be 'batched' if not modular
			@concat = @options.modular
			# Resolve default output file name for file>directory target
			unless path.extname(@output).length
				@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), ".#{@type}")
		# input is directory
		else
			# Resolve dependencies even if directory for css
			@concat = @type is 'css'

	# Generate output, 'compress'ing and 'lint'ing as required
	# @param {Function} fn(err, files)
	build: (fn) ->
		# Clear existing
		@sources = []
		@files = []
		print("building #{strong(path.basename(@input))} to #{strong(path.basename(@output))}", 2) unless @options.watching
		# Parse sources for input
		@_parse (err) =>
			return fn(err) if err
			if @sources.length
				async.forEach @sources, @_outputFile, (err) =>
					return fn(err, @files) if err
					fn(null, @files)
			else
				warn("no sources to build in #{strong(@input)}", 3)
				fn(null, @files)

	# Determine if a File exists in sources or a parent's
	# @param {File} file
	# @return	{Boolean}
	hasSource: (file) ->
		file in @sources or @options.hasParent and @options.parent.hasSource(file)

	# Reset modified files
	reset: ->
		@_modified.map((file) -> file.reset())
		@_modified = []
		@options.parent.reset() if @options.hasParent

	# Parse input sources
	# Resolve number of source files with dependencies
	# @param {Function} fn(err)
	_parse: (fn) =>
		outstanding = 0
		parse = (file, fn) =>
			# Parse file content, if necessary
			outstanding++
			file.parseContent (err) =>
				# Exit if compile error
				return fn(err) if err
				# Add dependencies
				if @concat and file.dependencies.length
					file.dependencies.forEach (dependency, idx) =>
						# Resolve dependency
						if dep = @options.source.byModule[dependency] or @options.source.byModule["#{dependency}/index"]
							# Protect against circular references and duplicates
							unless dep.isDependency
								# Store dependency references
								@_modified.push(dep)
								dep.isDependency = true
								file.dependencies[idx] = dep
								debug("added dependency #{strong(dep.moduleID)} to #{strong(file.moduleID)}", 3)
								# Parse
								parse(dep, fn)
						else
							warn("dependency #{strong(dependency)} for #{strong(file.moduleID)} not found", 4)
				outstanding--
				# Return when finished
				return fn() unless outstanding

		# Input is directory
		if @isDir
			# Grab files
			readdir @input, ignored, (err, files) =>
				# Find files in source cache
				files.forEach (filepath) =>
					if file = @options.source.byPath[filepath]
						# Add unless already added
						unless @hasSource(file)
							@sources.push(file)
							@_modified.push(file)
							parse file, (err) =>
								return fn(err) if err
								# Filter out all files that are dependants
								@sources = @sources.filter((file) -> not file.isDependency)
								fn() unless outstanding
						else
							return fn() unless outstanding
		# Input is file
		else
			if file = @options.source.byPath[@input]
				# Add unless already added
				unless @hasSource(file)
					@sources.push(file)
					@_modified.push(file)
					parse(file, fn)
				else
					return fn()

	# Output file sequence
	# @param {File} file
	# @param {Function} fn(err)
	_outputFile: (file, fn) =>
		if @concat
			# Concatenate
			content = file.options.module.concat(file)
			debug("concatenated: #{strong(path.relative(process.cwd(), file.filepath))}", 3)
		else
			# Optionally wrap content
			content = file.getContent(@options.modular)
		# Resolve output path if directory
		filepath = if path.extname(@output).length then @output else path.join(@output, file.qualifiedName) + '.' + @type
		# Sequence
		async.waterfall [
			((cb) => @_compile(content, filepath, file.options.compiler, cb)),
			@_lint,
			@_compress,
			@_write
		], (err) =>
			return fn(err) if err
			fn()

	# Compile contents, if necessary
	# @param {String} content
	# @param {String} filepath
	# @param {Object} compiler
	# @param {Function} fn(err, content, filepath)
	_compile: (content, filepath, compiler, fn) =>
		if @options.compile and compiler
			compiler.compile content, (err, content) =>
				return fn(err) if err
				debug("compiled: #{strong(path.relative(process.cwd(), filepath))}", 3)
				fn(null, content, filepath)
		else
			fn(null, content, filepath)

	# Lint contents, if necessary
	# @param {String} content
	# @param {String} filepath
	# @param {Function} fn(err, content, filepath)
	_lint: (content, filepath, fn) =>
		if @options.lint
			@options.linter.lint content, (err) =>
				if err
					warn('failed linting', 3)
					err.items.forEach (item) =>
						if item
							print("[#{colour(item.line, notify.CYAN)}:#{colour(item.col, notify.CYAN)}] #{item.reason}:", 4)
							print("#{strong(item.evidence)}", 5) if item.evidence
				else
					print("#{colour('linted', GREEN)} #{strong(path.relative(process.cwd(), filepath))}", 3)
				fn(null, content, filepath)
		else
			fn(null, content, filepath)

	# Compress contents, if necessary
	# @param {String} content
	# @param {String} filepath
	# @param {Function} fn(err, content, filepath)
	_compress: (content, filepath, fn) =>
		if @options.compress
			@options.compressor.compress content, (err, content) =>
				return fn(err) if err
				print("#{colour('compressed', notify.GREEN)} #{strong(path.relative(process.cwd(), filepath))}", 3)
				fn(null, content, filepath)
		else
			fn(null, content, filepath)

	# Write contents to disk
	# @param {String} content
	# @param {String} filepath
	# @param {Function} fn(err)
	_write: (content, filepath, fn) =>
		mkdir filepath, (err) =>
			return fn(err) if err
			# Add header for concatenated files
			content = "#{BUILT_HEADER}#{new Date().toString()}*/\n#{content}" if @concat
			fs.writeFile filepath, content, 'utf8', (err) =>
				return fn(err) if err
				@files.push(filepath)
				print("#{colour('built', notify.GREEN)} #{strong(path.relative(process.cwd(), filepath))}", if @options.watching then 4 else 3)
				fn()
