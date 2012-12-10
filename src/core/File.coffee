fs = require('fs')
path = require('path')
async = require('async')
{debug, strong} = require('../utils/notify')
{existsSync} = require('../utils/fs')

RE_BUILT_HEADER = /^\/\*BUILT/g
RE_ESCAPE = /\\|\r?\n|"/g
ESCAPE_MAP =
	'\\': '\\\\'
	'\n': '\\n'
	'\r\n': '\\n'
	'"': '\\"'

# File instance factory
# @param {String} type
# @param {String} filepath
# @param {String} basepath
# @param {Object} options
# @param {Function} fn(err, instance)
module.exports = (type, filepath, basepath, options, fn) ->
	filepath = path.resolve(filepath)
	# Validate file
	return fn("#{strong(filepath)} not found in project path") unless existsSync(filepath)
	extension = path.extname(filepath)[1..]
	if extension is type
		options.compile = false
		valid = true
	else
		# Loop through compilers
		for name, compiler of options.processors.compilers
			if extension is compiler.extension
				# Only js sources are compiled at the file level
				options.compile = type is 'js'
				options.compiler = compiler
				valid = true
				break
	unless valid
		return fn("invalid file type #{strong(path.relative(process.cwd(), filepath))}")
	else
		# Override options
		options.lazy = false if type is 'css'
		options.compress = options.lazy and options.compress
		options.module = options.processors.module
		options.compressor = options.processors.compressor if options.compress
		# Return instance
		return fn(null, new File(type, filepath, basepath, options))

# File class
class File

	# Constructor
	# @param {String} type
	# @param {String} filepath
	# @param {String} basepath
	# @param {Object} options
	constructor: (@type, @filepath, @basepath, @options) ->
		@name = path.basename(@filepath)
		# qualified name, with path from base source directory
		@qualifiedName = path.relative(@basepath, @filepath).replace(path.extname(@name), '')
		@moduleID = @options.module.getModuleID(@qualifiedName)
		@dependencies = []
		@isDependency = false
		@_content = ''
		debug("created #{@type} File instance #{strong(path.relative(process.cwd(), @filepath))} with moduleID: #{strong(@moduleID)}", 3)

	# Parse the file's content from disk
	# @param {Function} fn(err)
	parseContent: (fn) ->
		if @_content
			process.nextTick(=>fn())
		else
			fs.readFile @filepath, 'utf8', (err, content) =>
				return fn(err) if err
				# Abort if this is a built file
				return fn() if content.match(RE_BUILT_HEADER)
				# Store
				@_content = content
				# Resolve dependencies
				@dependencies = @options.module.getModuleDependencies(@_content, @moduleID)
				# Optionally compile, compress, escape
				async.series([@_compile, @_compress, @_escape], fn)

	getContent: (wrapped) ->
		return if wrapped then @options.module.wrapModuleContents(@_content, @moduleID, @options.lazy) else @_content

	clearContent: ->
		@_content = ''

	# Reset instance for reuse
	reset: ->
		@dependencies = if @_content then @options.module.getModuleDependencies(@_content, @moduleID) else []
		@isDependency = false

	# Destroy instance
	destroy: ->
		@reset()
		@clearContent()
		@options = null

	# Compile content
	# @param {Function} fn(err)
	_compile: (fn) =>
		if @options.compile
			@options.compiler.compile @_content, (err, compiled) =>
				return fn(err) if err
				debug("compiled: #{strong(path.relative(process.cwd(), @filepath))}", 3)
				@_content = compiled
				fn()
		else
			fn()

	# Compress content
	# (Only relevant for lazy js modules)
	# @param {Function} fn(err)
	_compress: (fn) =>
		if @options.compress
			@options.compressor.compress @_content, (err, compressed) =>
				return fn(err) if err
				debug("compressed: #{strong(path.relative(process.cwd(), @filepath))}", 3)
				@_content = compressed
				fn()
		else
			fn()

	# Escape content and stringify
	# (Only relevant for lazy js modules)
	# @param {Function} fn()
	_escape: (fn) =>
		if @options.lazy
			@_content = '"' + @_content.replace(RE_ESCAPE, (m) -> return ESCAPE_MAP[m]) + '"'
		fn()