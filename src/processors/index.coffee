path = require('path')
{existsSync} = require('../utils/fs')
notify = require('../utils/notify')

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
	# Create a copy of DEFAULTS
	defaults = JSON.parse(JSON.stringify(DEFAULTS))
	# Override if we have options
	options and overrideDefaults(options)
	loadModules (err, processors) ->
		if err then fn(err) else fn(null, exports.installed)
	return

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
	for category of options
		for type, processor of options[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(defaults[category][type])
				processor = [processor] unless Array.isArray(processor)
				processor.forEach (plug) =>
					defaults[category][type].push(resolvePath(plug, type))
			else
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
						installed[category][type][idx] = require(proc)
					catch err
						return fn("failed loading processor #{notify.strong(proc)}")
			else
				installed[category][type] ?= {}
				try
					installed[category][type] = require(processor)
				catch err
					return fn("failed loading processor #{notify.strong(processor)}")
	exports.installed = installed
	return fn()

