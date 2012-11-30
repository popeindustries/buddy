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
		@isDependency = false
		@content = ''

	# Retrieve the file's content, compiled if necessary
	# @param {Boolean} compile
	# @param {Function} fn(err, content)
	parseContent: (compile, fn) ->
		if @content
			process.nextTick(=>fn())
		else
			fs.readFile @filepath, 'utf8', (err, content) =>
				return fn(err) if err
				# Abort if this is a built file
				return fn() if content.match(RE_BUILT_HEADER)
				@dependencies = @module.getModuleDependencies(content, @moduleID)
				# Compile
				if compile and @needsCompile
					@compiler.compile content, (err, compiled) =>
						return fn(err) if err
						@content = compiled
						fn()
				else
					@content = content
					fn()

	reset: ->
		@dependencies = []
		@isDependency = false
		@content = ''

	destroy: ->
		@reset()
		@compiler = null
		@module = null
