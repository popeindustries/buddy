path = require('path')

RE_WIN_SEPARATOR = /\\\\?/g
# "@import 'moduleid'"
RE_MODULE = /^require\.register\(.+function *\( *module *, *exports *, *require *\) *{/gm
RE_COMMENT_LINES = /^\s*(?:\/\/|#).+$/gm
RE_SPACES = /\s/

module.exports =
	name: 'css'
	category: 'css'
	type: 'module'

	# Retrieve a module's id based on it's 'qualifiedFilename'
	# @param {String} qualifiedFilename
	# @return {String}
	getModuleId: (qualifiedFilename) ->

	# Retrieve all module references in file 'contents'
	# Convert all references relative to 'id'
	# @param {String} contents
	# @param {String} id
	# @return {Array}
	getModuleDependencies: (contents, id) ->

	# Wrap 'contents' in module definition if not already wrapped
	# @param {String} contents
	# @param {String} id
	# @return {String}
	wrapModuleContents: (contents, id) ->
		return contents

