fs = require('fs')
path = require('path')
{existsSync} = require('./utils')

NAME = '.buddy-filelog'
RE_ABSOLUTE = /^([a-z]:\\)|\//i

module.exports = class Filelog

	constructor: ->
		@filename = path.resolve(NAME)
		# TODO: async stat, readfile
		# Load existing
		@files = if existsSync(@filename) then JSON.parse(json = fs.readFileSync(@filename, 'utf8')) else []
		# Clean if file is old or from another system
		if @files.length
			if (path.sep is '/' and json.indexOf('\\') isnt -1) or (path.sep is '\\' and json.indexOf('/') isnt -1) or RE_ABSOLUTE.test(@files[0])
				@clean()

	# Add 'files' to the file log
	# @param {Array} files
	add: (files) ->
		files.forEach (file) =>
			file = path.relative(process.cwd(), file)
			@files.push(file) if @files.indexOf(file) is -1
		# TODO: async write
		# Save
		fs.writeFileSync(@filename, JSON.stringify(@files))

	# Clean the file log of file references
	clean: ->
		# Save
		@files = []
		# TODO: async write
		fs.writeFileSync(@filename, JSON.stringify(@files), 'utf8')