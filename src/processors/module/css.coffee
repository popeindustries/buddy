path = require('path')

# '\' or '\\'
RE_WIN_SEPARATOR = /\\\\?/g
# "@import 'moduleid'"
RE_IMPORT = /@import\s['|"](.*?)['|"]/g
RE_COMMENT_LINES = /^\s*(?:\/\/|#|\/\*).+(?:\*\/)?$/gm
RE_SPACES = /\s/

module.exports =
	name: 'css'
	category: 'css'
	type: 'module'

	# Retrieve a module's id based on it's 'qualifiedFilename'
	# @param {String} qualifiedFilename
	# @return {String}
		# Convert to lowercase and remove spaces
		module = qualifiedFilename.toLowerCase().replace(RE_SPACES, '')
	getModuleID: (qualifiedFilename) ->
		# Fix path separator for windows
		if process.platform is 'win32'
			module = module.replace(RE_WIN_SEPARATOR, '/')
		return module

	# Retrieve all module references in file 'contents'
	# @param {String} contents
	# @param {String} id
	# @return {Array}
	getModuleDependencies: (contents, id) ->
		deps = []
		# Remove commented lines
		contents = contents.replace(RE_COMMENT_LINES, '')
		# Match all uses of '@import'
		while match = RE_IMPORT.exec(contents)
			deps.push(match[1])
		return deps

	# Wrap 'contents' in module definition if not already wrapped
	# @param {String} contents
	# @param {String} id
	# @return {String}
	wrapModuleContents: (contents, id) ->
		return contents

	inlineDependencies: (contents, dependencies) ->
