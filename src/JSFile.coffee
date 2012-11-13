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
		@dependencies = []

	# Read file contents and parse dependencies if 'modular'
	# @param {Boolean} modular
	parseContents: (modular) ->
		super()
		# Prepare module
		if modular
			# Parse dependencies
			@dependencies = @module.getModuleDependencies(@_contents, @moduleId)

	# Return contents, compiled if necessary, and wrapped in module wrappr
	# @param {Object} options
	# @param {Function} fn
	getContents: (options, fn) ->
		super options, (err, contents) =>
			if err
				fn(err)
			else
				fn(null, if options.modular then @module.wrapModuleContents(contents, @moduleId) else contents)

