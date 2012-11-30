path = require('path')
fs = require('fs')

module.exports =
	name: 'amd'
	category: 'js'
	type: 'module'

	# Return module id
	getModuleID: (qualifiedFilename) ->
		return ''

	# Retrieve all module references in file contents
	getModuleDependencies: (contents, id) ->
		deps = []
		return deps

	# Wrap compiled content in module definition if it doesn't already have a wrapper
	# Bootstrap if main entry point
	wrapModuleContents: (contents, id, isMain = false) ->
		return contents

	# Return module framework source contents
	getModuleFrameworkSource: ->
		return ''

