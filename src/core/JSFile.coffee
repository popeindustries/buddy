File = require('./file')

module.exports = class JSFile extends File

	# Constructor
	# @param {String} filepath
	# @param {String} basepath [root source location]
	# @param {Object} compilers
	# @param {Object} module [module plugin]
	constructor: (filepath, basepath, compilers, @module) ->
		super('js', filepath, basepath, compilers)
		@moduleId = @module?.getModuleId(@qualifiedFilename)

	# Read file contents and parse dependencies if 'modular'
	# @param {Boolean} modular
	# @param {Function} fn(err)
	parseContents: (modular, fn) ->
		super (err, data) =>
			return fn(err) if err
			# Prepare module
			if modular
				# Parse dependencies
				@dependencies = @module.getModuleDependencies(data, @moduleId)
			fn(null, data)

	# Return contents, compiled if necessary, and wrapped in module wrappr
	# @param {Object} options
	# @param {Function} fn(err, data)
	getContents: (options, fn) ->
		super options, (err, data) =>
			if err
				fn(err)
			else
				fn(null, if options.modular then @module.wrapModuleContents(data, @moduleId) else data)

