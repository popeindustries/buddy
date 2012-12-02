path = require('path')
{indent, debug} = require('../../utils/notify')

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

	# Retrieve all module references in file 'content'
	# Convert all references relative to 'id'
	# @param {String} content
	# @param {String} id
	# @return {Array}
	getModuleDependencies: (content, id) ->
		deps = []
		# Remove commented lines
		content = content.replace(RE_COMMENT_LINES, '')
		# Match all uses of 'require' and resolve relative path
		while match = RE_REQUIRE.exec(content)
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

	# Wrap 'content' in module definition if not already wrapped
	# @param {String} content
	# @param {String} id
	# @return {String}
	wrapModuleContents: (content, id) ->
		# Reset
		RE_MODULE.lastIndex = 0
		unless RE_MODULE.test(content)
			content =
				"""
				require.register('#{id}', function(module, exports, require) {
				#{indent(content, 2)}
				});
				"""
		return content

	# Concatenate wrapped file and dependency content
	# @param {File} file
	# @return String
	concat: (file) ->
		contents = []
		add = (file) ->
			# First add dependencies
			file.dependencies.forEach (dependency) -> add(dependency)
			# Wrap contents
			content = module.exports.wrapModuleContents(file.content, file.moduleID)
			# Store if not already stored
			contents.push(content) if contents.indexOf(content) is -1

		add(file)
		return contents.join('\n')