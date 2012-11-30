fs = require('fs')
path = require('path')
async = require('async')
notify = require('../utils/notify')
{existsSync} = require('../utils/fs')

RE_BUILT_HEADER = /^\/\*BUILT/g

# File instance factory
# @param {String} type
# @param {String} filepath
# @param {String} basepath
# @param {Object} processors
# @param {Function} fn(err, instance)
module.exports = (type, filepath, basepath, processors, fn) ->
	filepath = path.resolve(filepath)

	# Validate file
	return fn("#{notify.strong(filepath)} not found in project path") unless existsSync(filepath)
	extension = path.extname(filepath)[1..]
	if extension is type
		valid = true
	else
		# Loop through compilers
		for name, compiler of processors.compilers
			if extension is compiler.extension
				valid = true
				break
	unless valid
		return fn("invalid file type #{notify.strong(path.relative(process.cwd(), filepath))}")
	else
		# Return instance
		return fn(null, new File(type, filepath, basepath, compiler, processors.module))

# File class
class File

	# Constructor
	# @param {String} type
	# @param {String} filepath
	# @param {String} basepath
	# @param {Object} compiler
	# @param {Object} module
	constructor: (@type, @filepath, @basepath, @compiler, @module) ->
		@name = path.basename(@filepath)
		# qualified name, with path from base source directory
		@qualifiedName = path.relative(@basepath, @filepath).replace(path.extname(@name), '')
		@needsCompile = @compiler?
		@moduleID = @module.getModuleID(@qualifiedName)
		@dependencies = []
		@content = ''
		@dependant = null

	# Retrieve the file's content, compiled if necessary
	# @param {Function} fn(err, content)
	parseContent: (fn) ->
		if @content
			process.nextTick(=>fn(null))
		else
			fs.readFile @filepath, 'utf8', (err, content) =>
				return fn(err) if err
				@dependencies = @module.getModuleDependencies(content, @moduleId)
				@dependencies = @module.getModuleDependencies(content, @moduleID)
				# Compile
				# if compiled and @needsCompile
				# 	@compiler.compile content, (err, compiled) =>
				# 		return fn(err, '') if err
				# 		@content = compiled
				# 		fn(null, compiled)
				# else
				@content = content
				fn(null)

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