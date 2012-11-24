path = require('path')
{notify, existsSync} = require('./utils')

DEFAULTS =
	js:
		compilers: ['./plugins/compilers/coffeescript']
		compressor: './plugins/compressor/uglifyjs'
		linter: './plugins/linter/jshint'
		module: './plugins/module/node'
	css:
		compilers: ['./plugins/compilers/less', './plugins/compilers/stylus']
		compressor: './plugins/compressor/cleancss'
		linter: './plugins/linter/csslint'
	html: {}

defaults = null

# Load all plugin modules, overriding defaults if specified in 'options'
# @param {Object} options
# @param {Function} fn(err, plugins)
exports.load = (options, fn) ->
	# Create a copy of DEFAULTS
	defaults = JSON.parse(JSON.stringify(DEFAULTS))
	# Override if we have options
	options and overrideDefaults(options)
	loadModules (err, plugins) ->
		if err then fn(err) else fn(null, plugins)
	return

# Resolve plugin path
# Handles overrides of defaults specified in configuration
# @param {String} plugin
# @param {String} type
resolvePath = (plugin, type) ->
	# Try version specified in configuration
	pluginPath = path.resolve(plugin)
	# Fallback to default version
	pluginPath = path.resolve(__dirname, 'plugins', type, plugin) unless existsSync(pluginPath + '.js')
	return pluginPath

# Override plugin defaults with those specified in 'options'
# @param {Object} options
overrideDefaults = (options) ->
	for category of options
		for type, plugin of options[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(defaults[category][type])
				plugin = [plugin] unless Array.isArray(plugin)
				plugin.forEach (plug) =>
					defaults[category][type].push(resolvePath(plug, type))
			else
				defaults[category][type] = resolvePath(plugin, type)

# Load plugin modules
# @param {Function} fn(err, plugins)
loadModules = (fn) ->
	plugins = {}
	for category of defaults
		# Create category hash
		plugins[category] ?= {}
		for type, plugin of defaults[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(plugin)
				plugins[category][type] ?= []
				for plug, idx in plugin
					try
						plugins[category][type][idx] = require(plug)
					catch err
						return fn("loading plugin #{notify.strong(plug)}")
			else
				plugins[category][type] ?= {}
				try
					plugins[category][type] = require(plugin)
				catch err
					return fn("loading plugin #{notify.strong(plugin)}")
	return fn(null, plugins)

