path = require('path')
fs = require('fs')
{indent} = require('../../utils')

RE_WIN_SEPARATOR = /\\\\?/g
# "require.register('id', function(module, exports, require) {"
RE_MODULE = /^require\.register\(.+function *\( *module *, *exports *, *require *\) *{/gm
RE_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
RE_REQUIRE = /require[\s|\(]['|"](.*?)['|"]/g
RE_SPACES = /\s/

module.exports =
	name: 'node'
	category: 'js'
	type: 'module'

	# Return module id
	getModuleId: (qualifiedFilename) ->
		# Convert to lowercase and remove spaces
		module = qualifiedFilename.toLowerCase().replace(RE_SPACES, '')
		# Fix path separator for windows
		if process.platform is 'win32'
			module = module.replace(RE_WIN_SEPARATOR, '/')
		return module

	# Retrieve all module references in file contents
	getModuleDependencies: (contents, id) ->
		deps = []
		# Remove commented lines
		contents = contents.replace(RE_COMMENT_LINES, '')
		# Match all uses of 'require' and parse path
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

	# Wrap compiled content in module definition if it doesn't already have a wrapper
	wrapModuleContents: (contents, id) ->
		unless RE_MODULE.test(contents)
			contents =
				"""
				require.register('#{id}', function(module, exports, require) {
				#{indent(contents, 2)}
				});
				"""
		return contents

