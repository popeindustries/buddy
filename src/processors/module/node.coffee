path = require('path')
{indent} = require('../../utils/notify')

# '\' or '\\'
RE_WIN_SEPARATOR = /\\\\?/g
# "require.register('id', function(module, exports, require)"
# "require.register 'id', (module, exports, require)"
RE_MODULE = /require\.register[\s|\(].+(?:function)? *\( *module *, *exports *, *require *\)/gm
RE_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]/g
RE_SPACES = /\s/

module.exports =
	name: 'node'
	category: 'js'
	type: 'module'

	# Retrieve a module's id based on it's 'qualifiedFilename'
	# @param {String} qualifiedFilename
	# @return {String}
	getModuleID: (qualifiedFilename) ->
		# Convert to lowercase and remove spaces
		module = qualifiedFilename.toLowerCase().replace(RE_SPACES, '')
		# Fix path separator for windows
		if process.platform is 'win32'
			module = module.replace(RE_WIN_SEPARATOR, '/')
		return module

	# Retrieve all module references in file 'contents'
	# Convert all references relative to 'id'
	# @param {String} contents
	# @param {String} id
	# @return {Array}
	getModuleDependencies: (contents, id) ->
		deps = []
		# Remove commented lines
		contents = contents.replace(RE_COMMENT_LINES, '')
		# Match all uses of 'require' and resolve relative path
		while match = RE_REQUIRE.exec(contents)
			dep = match[1]
			parts = dep.split('/')
			# Resolve relative path
			if dep.charAt(0) is '.'
				parts = id.split('/')
				parts.pop()
				for part in dep.split('/')
					if part is '..' then parts.pop()
					else unless part is '.' then parts.push(part)
			deps.push(parts.join('/'))
		return deps

	# Wrap 'contents' in module definition if not already wrapped
	# @param {String} contents
	# @param {String} id
	# @param {Boolean} isCoffee
	# @return {String}
	wrapModuleContents: (contents, id, isCoffee = false) ->
		# Reset
		RE_MODULE.lastIndex = 0
		unless RE_MODULE.test(contents)
			contents =
				if isCoffee
					"""
					require.register('#{id}', (module, exports, require) ->
					#{indent(contents, 2)}
					)
					"""
				else
					"""
					require.register('#{id}', function(module, exports, require) {
					#{indent(contents, 2)}
					});
					"""
		return contents

