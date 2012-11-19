fs = require('fs')
path = require('path')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync
{notify} = require('./utils')

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
# @return {Object}
loadModules = ->
	plugins = {}
	for category of defaults
		# Create category hash
		plugins[category] ?= {}
		for type, plugin of defaults[category]
			# Handle arrays of plugins for 'compilers'
			if Array.isArray(plugin)
				plugins[category][type] ?= []
				plugin.forEach (plug, idx) =>
					try
						plugins[category][type][idx] = require(plug)
					catch err
						notify.error("loading plugin #{notify.strong(plug)}", 2)
			else
				plugins[category][type] ?= {}
				try
					plugins[category][type] = require(plugin)
				catch err
					notify.error("loading plugin #{notify.strong(plugin)}", 2)
	return plugins

# Load all plugin modules, overriding defaults if specified in 'options'
# @param {Object} options
# @return {Object}
exports.load = (options) ->
	# Create a copy of DEFAULTS
	defaults = JSON.parse(JSON.stringify(DEFAULTS))
	# Override if we have options
	options and overrideDefaults(options)
	return loadModules()

