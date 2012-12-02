path = require('path')
{existsSync} = require('../utils/fs')
{debug, strong} = require('../utils/notify')

DEFAULTS =
	js:
		compilers: ['./compilers/coffeescript', './compilers/typescript']
		compressor: './compressor/uglifyjs'
		linter: './linter/jshint'
		module: './module/node'
	css:
		compilers: ['./compilers/less', './compilers/stylus']
		compressor: './compressor/cleancss'
		linter: './linter/csslint'
		module: './module/css'
	html: {}

defaults = null

exports.installed = null

# Load all processor modules, overriding defaults if specified in 'options'
# @param {Object} options
# @param {Function} fn(err)
exports.load = (options, fn) ->
	debug('PROCESSORS', 1)
	# Create a copy of DEFAULTS
	defaults = JSON.parse(JSON.stringify(DEFAULTS))
	# Override if we have options
	options and overrideDefaults(options)
	loadModules (err, processors) ->
		return fn(err) if err
		fn(null, exports.installed)

# Resolve processor path
# Handles overrides of defaults specified in configuration
# @param {String} processor
# @param {String} type
resolvePath = (processor, type) ->
	# Try version specified in configuration
	processorPath = path.resolve(processor)
	# Finstalledback to default version
	processorPath = path.resolve(__dirname, type, processor) unless existsSync(processorPath + '.js')
	return processorPath

# Override processor defaults with those specified in 'options'
# @param {Object} options
overrideDefaults = (options) ->
	debug('overriding defaults', 2)
	for category of options
		for type, processor of options[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(defaults[category][type])
				processor = [processor] unless Array.isArray(processor)
				processor.forEach (plug) =>
					debug("override #{category}/#{type} with: #{strong(plug)}", 3)
					defaults[category][type].push(resolvePath(plug, type))
			else
				debug("override #{category}/#{type} with: #{strong(processor)}", 3)
				defaults[category][type] = resolvePath(processor, type)

# Load processor modules
# @param {Function} fn(err)
loadModules = (fn) ->
	installed = {}
	for category of defaults
		# Create category hash
		installed[category] ?= {}
		for type, processor of defaults[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(processor)
				installed[category][type] ?= []
				for proc, idx in processor
					try
						debug("load #{category}/#{type}:#{idx} => #{strong(proc)}", 2)
						installed[category][type][idx] = require(proc)
					catch err
						return fn("failed loading processor #{strong(proc)}")
			else
				installed[category][type] ?= {}
				try
					debug("load #{category}/#{type} => #{strong(processor)}", 2)
					installed[category][type] = require(processor)
				catch err
					return fn("failed loading processor #{strong(processor)}")
	exports.installed = installed
	return fn()

