path = require('path')

# '\' or '\\'
RE_WIN_SEPARATOR = /\\\\?/g
# "@import 'moduleid'"
RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
RE_COMMENT_LINES = /^\s*(?:\/\/|#|\/\*).+(?:\*\/)?$/gm

module.exports =
	name: 'css'
	category: 'css'
	type: 'module'

	# Retrieve a module's id based on it's 'qualifiedFilename'
	# @param {String} qualifiedFilename
	# @return {String}
	getModuleID: (qualifiedFilename) ->
		# Convert to lowercase
		module = qualifiedFilename.toLowerCase()
		# Fix path separator for windows
		if process.platform is 'win32'
			module = module.replace(RE_WIN_SEPARATOR, '/')
		return module

	# Retrieve all module references in file 'content'
	# @param {String} content
	# @param {String} id
	# @return {Array}
	getModuleDependencies: (content, id) ->
		deps = []
		# Remove commented lines
		content = content.replace(RE_COMMENT_LINES, '')
		# Match all uses of '@import'
		while match = RE_IMPORT.exec(content)
			deps.push(match[1].replace('.css', ''))
		return deps

	# Wrap 'content' in module definition if not already wrapped
	# @param {String} content
	# @param {String} id
	# @return {String}
	wrapModuleContents: (content, id) ->
		return content

	# Recursively inline dependency file content
	# @param {File} file
	# @return String
	concat: (file) ->
		inline = (file, content) ->
			file.dependencies.forEach (dependency) ->
				# First inline dependencies if necessary
				inlineContent = if dependency.dependencies.length then inline(dependency, dependency.content) else dependency.content
				# Replace @import with inline content
				re = new RegExp("^@import\\s['|\"]#{dependency.moduleID}(?:\\.css)?['|\"];?\\s*$", 'im')
				content = content.replace(re, inlineContent + '\n')
			content

		return inline(file, file.content)
