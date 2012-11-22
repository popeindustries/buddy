fs = require('fs')
path = require('path')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

NAME = '.buddy-filelog'
RE_ABSOLUTE = /^\/|^[A-Z]:\\/

module.exports = class Filelog

	constructor: ->
		@filename = path.resolve(NAME)
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
		# Save
		fs.writeFileSync(@filename, JSON.stringify(@files))

	# Clean the file log of file references
	clean: ->
		# Save
		@files = []
		fs.writeFileSync(@filename, JSON.stringify(@files), 'utf8')