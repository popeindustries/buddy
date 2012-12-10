path = require('path')

# '\' or '\\'
RE_WIN_SEPARATOR = /\\\\?/g
# "@import 'moduleid'"
RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
# RE_COMMENT_LINES = /^\s*(?:\/\/|#|\/\*).+(?:\*\/)?$/gm
RE_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))$/gm

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
			dep = match[1].replace('.css', '')
			# Force relative path
			dep = ('./' + dep) if dep.indexOf('/') is -1
			parts = dep.split('/')
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
		# No op
		return content

	# Recursively inline dependency file content
	# @param {File} file
	# @return String
	concat: (file) ->
		inline = (file, content) ->
			file.dependencies.forEach (dependency) ->
				# First inline dependencies if necessary
				inlineContent = if dependency.dependencies.length then inline(dependency, dependency.getContent(false)) else dependency.getContent(false)
				# Replace @import with inline content
				# Use fuzzy match to get around absolute and relative pathing differences
				id = dependency.moduleID.split('/').reverse()[0]
				re = new RegExp("^@import\\s['|\"](?:\\.\\/)?(?:\\w*\/)?#{id}(?:\\.css)?['|\"];?\\s*$", 'im')
				content = content.replace(re, inlineContent + '\n')
			content

		# Remove comments and return
		return inline(file, file.getContent(false)).replace(RE_COMMENT_LINES, '')
