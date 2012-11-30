fs = require('fs')
path = require('path')
async = require('async')
notify = require('../utils/notify')
{indir, readdir, mkdir, existsSync, ignored} = require('../utils/fs')

BUILT_HEADER = '/*BUILT '

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
		@compress = false
		@lint = false
		# css targets are compiled after concat, js targets are precompiled
		@compile = @type is 'css'
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
	build: (@compress, @lint, fn) ->
		# Clear existing
		@sources = []
		@files = []
		# Parse sources for input
		@_parse (err) =>
			return fn(err) if err
			if @sources.length
				notify.print("building #{notify.strong(path.basename(@input))} to #{notify.strong(path.basename(@output))}", 2) unless @watching
				async.forEach @sources, @_outputFile, (err, content) =>

			else
				notify.warn("no sources to build in #{notify.strong(@input)}", 2)
				fn(null, @files)

	# Determine if a File exists in sources or a parent's
	# @param {File} file
	# @return	{Boolean}
	hasSource: (file) ->
		file in @sources or @options.parent and @options.parent.hasSource(file)

	# Parse input sources
	# @param {Function} fn(err)
	_parse: (fn) ->
		outstanding = 0
		parse = (file, fn) =>
			# Parse file content, if necessary
			outstanding++
			unless file.content
				file.parseContent !@compile, (err) =>
					# Exit if compile error
					return fn(err) if err
					# Add dependencies
					if @concat and file.dependencies.length
						file.dependencies.forEach (dependency, idx) =>
							# Resolve dependency
							if dep = @options.source.byModule[dependency] or @options.source.byModule["#{dependency}/index"]
								# Protect against circular references
								unless dep.isDependency
									# Store dependency references
									dep.isDependency = true
									file.dependencies[idx] = dep
									# Parse
									parse(dep, fn)
							else
								notify.warn("dependency #{notify.strong(dependency)} for #{notify.strong(file.moduleID)} not found", 4)
					outstanding--
					# Return when finished
					return fn() unless outstanding
			else
				outstanding--
				# Return when finished
				return fn() unless outstanding

		if @isDir
			# Grab files
			readdir @input, ignored, (err, files) =>
				# Find files in source cache
				files.forEach (filepath) =>
					if file = @options.source.byPath[filepath]
						unless @hasSource(file)
							@sources.push(file)
							parse file, (err) =>
								return fn(err) if err
								# Filter out all files that are dependants
								@sources = @sources.filter((file) -> not file.isDependency)
								fn()
						else
							return fn() unless outstanding
		else
			if file = @options.source.byPath[@input]
				unless @hasSource(file)
					@sources.push(file)
					parse(file, fn)
				else
					return fn()

	_outputFile: (file, fn) ->
		# Concatenate
		content = file.module.concat(file)
		filepath = if path.extname(@output).length then @output else path.join(@output, file.qualifiedName) + '.' + @type
		async.waterfall [
			((cb) => @_compile(content, filepath, file.compiler, cb)),
			@_lint,
			@_compress,
			@_write
		], (err) =>
			return fn(err) if err
			fn()

	_compile: (content, filepath, compiler, fn) =>
		if @compile and compiler
			compiler.compile content, (err, content) =>
				return fn(err) if err
				fn(null, content, filepath)
		else
			fn(null, content, filepath)

	_lint: (content, filepath, fn) =>
		fn(null, content, filepath)

	_compress: (content, filepath, fn) =>
		if @compress
			@processors.compressor.compress content, (err, content) =>
				return fn(err) if err
				notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), filepath))}", 3)
				fn(null, content, filepath)
		else
			fn(null, content, filepath)

	_write: (content, filepath, fn) =>
		mkdir filepath, (err) =>
			return fn(err) if err
			content = "#{BUILT_HEADER}#{new Date().toString()}*/\n#{content}" if @concat
			fs.writeFile filepath, content, 'utf8', (err) =>
				return fn(err) if err
				@files.push(filepath)
				notify.print("#{notify.colour('built', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), filepath))}", if @watching then 4 else 3)
				fn()


###
	_lint: (content, filepath) ->
		if @options.linter?
			@options.linter.lint content, (err) =>
				if err
					notify.warn('failed linting', 4)
					err.items.forEach (item) =>
						notify.print("[#{item.line}:#{item.col}] #{item.reason}", 5)
				else
					notify.print("#{notify.colour('passed linting', notify.GREEN)} #{notify.strong(path.basename(filepath))}", 4)

###