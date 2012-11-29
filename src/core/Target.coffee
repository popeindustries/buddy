fs = require('fs')
path = require('path')
async = require('async')
notify = require('../utils/notify')
{indir, readdir, existsSync, ignored} = require('../utils/fs')

# Target instance factory
# @param {String} type
# @param {Object} options
# @param {Object} processors
# @param {Function} fn(err, instance)
module.exports = (type, options, processors, fn) ->
	inputpath = path.resolve(options.input)
	outputpath = path.resolve(options.output)

	# Validate target
	# Abort if input doesn't exist
	return fn("#{notify.strong(options.input)} not found in project path") unless existsSync(inputpath)
	fs.stat inputpath, (err, stats) ->
		return fn(err) if err
		isDir = stats.isDirectory()
		# Check that input exists in sources
		for location in options.source.locations
			valid = indir(location, inputpath)
			break if valid
		# Abort if input doesn't exist in sources
		unless valid
			return fn("#{notify.strong(options.input)} not found in source path")
		# Abort if input is directory and output is file
		if isDir and path.extname(outputpath).length
			return fn("a file (#{notify.strong(options.output)}) is not a valid output target for a directory (#{notify.strong(options.input)}) input target")
		# Return instance
		return fn(null, new Target(type, isDir, options, processors))

# Target class
class Target

	# Constructor
	# @param {String} type
	# @param {Object} options
	# @param {Object} processors
	constructor: (@type, @isDir, @options, @processors) ->
		@input = path.resolve(@options.input)
		@output = path.resolve(@options.output)
		@sources = []
		@files = []
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
	# @param {Boolean} compress
	# @param {Boolean} lint
	# @param {Function} fn(err, files)
	build: (compress, lint, fn) ->
		# Clear existing
		@sources = []
		@files = []
		# Parse sources for input
		@_parse =>
			if @sources.length
				notify.print("building #{notify.strong(path.basename(@input))} to #{notify.strong(path.basename(@output))}", 2) #unless @watching
				# @_build(compress, lint, fn)
			else
				notify.warn("no sources to build in #{notify.strong(@input)}", 2)
				fn(null, @files)

	# Determine if a File exists in sources or a parent's
	# @param {File} file
	# @return	{Boolean}
	hasSource: (file) ->
		file in @sources or @options.parent and @options.parent.hasSource(file)

	# Parse input sources
	# @param {Function} fn
	_parse: (fn) ->
		outstanding = 0
		parse = (file, fn) =>
			# Get contents
			outstanding++
			# Parse file content
			file.parseContent (err) =>
				outstanding--
				# Not critical
				notify.warn("failed parsing contents of #{notify.strong(path.relative(process.cwd(), file.filepath))}", 4) if err
				# Add dependencies
				if @concat and file.dependencies.length
					file.dependencies.forEach (dependency, idx) =>
						# Resolve dependency
						if dep = @options.source.byModule[dependency] or @options.source.byModule["#{dependency}/index"]
							# Store dependency references
							dep.dependant = file
							file.dependencies[idx] = dep
							# Add if dependencies
							parse(dep) if dep.dependencies.length
						else
							notify.warn("dependency #{notify.strong(dependency)} for #{notify.strong(file.moduleId)} not found", 4)
				# Return when finished
				return fn() unless outstanding

		if @isDir
			# Grab files
			readdir @input, ignored, (err, files) =>
				files.forEach (filepath) =>
					if file = @options.source.byPath[filepath]
						@sources.push(file)
						parse file, =>
							# Filter out all files that are dependants
							@sources = @sources.filter((file) -> !file.dependant)
							fn()
		else
			if file = @options.source.byPath[@input]
				@sources.push(file)
				parse(file, fn)

	# Add 'file' to sources
	# Trigger file content parsing and resolve dependencies
	# @param {File} file
	# @param {Function} fn(err)
	_add: (file, fn) ->
		outstanding = 0
		add = (file) =>
			@sources.push(file) unless file.dependant
			# Get contents
			outstanding++
			# Parse file content
			file.parseContent (err) =>
				outstanding--
				return fn(err) if err
				# Add dependencies
				if @concat and file.dependencies.length
					file.dependencies.forEach (dependency, idx) =>
						# Resolve dependency
						if dep = @options.source.byModule[dependency] or @options.source.byModule["#{dependency}/index"]
							dep.dependant = true
							file.dependencies[idx] = dep
							# Add if dependencies
							add(dep) if dep.dependencies.length
						else
							notify.warn("dependency #{notify.strong(dependency)} for #{notify.strong(file.moduleId)} not found", 4)
				# Return when finished
				return fn() unless outstanding
		# Return if already added
		if @hasSource(file)
			fn()
		else
			# Reset dependant flag
			file.dependant = false
			add(file)

	_concat: (fn) ->
		contents = @sources.map (file) ->
			return file.content



###
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