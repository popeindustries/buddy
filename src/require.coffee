###
  CommonJS inspired module framework for the browser.
  @see https://github.com/stephank/villain/blob/master/src/util/brequire.coffee
###

# Load or return cached version of requested module
require = (path) ->
	m = require.modules[path] or require.modules[path += '/index']
	throw "Couldn't find module for: #{path}" unless m
	# Instantiate the module if it's export object is not yet defined
	unless m.exports
		m.exports = {}
		m.call m.exports, m, m.exports, require.bind(path)
	# Return the export object
	m.exports

# Cache of module objects
require.modules = {}

# Partial completion of the module's inner 'require' function
# Resolves paths relative to the module's current location
require.bind = (path) ->
	(p) ->
		return require(p) unless p.charAt(0) == '.'
		# Use the module's own path to resolve relative paths
		paths = path.split('/')
		paths.pop()
		for part in p.split('/')
			# One up if '../'
			if part is '..' then paths.pop()
			# One down if './'
			else unless part is '.' then paths.push(part)
		# Construct full path
		require paths.join('/')

# Module definition function
# fn signature should be of type (module, exports, require)
require.module = (path, fn) ->
	require.modules[path] = fn
	
# Exports
window.require = require
