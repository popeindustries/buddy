fs = require('fs')
path = require('path')
{notify, mkdir, indent} = require('./utils')
Target = require('./target')

module.exports = class CSSTarget extends Target

	# Constructor
	# @param {String} input
	# @param {String} output
	# @param {Object} fileCache
	# @param {Object} options
	constructor: (input, output, fileCache, options) ->
		super('css', input, output, fileCache, options)

	# Generate output, optionally compressing and linting
	# @param {Boolean} compress
	# @param {Boolean} lint
	_build: (compress, lint) ->
		@sources.forEach (file, idx) =>
			# Resolve output name
			filepath = if path.extname(@output).length then @output else path.join(@output, file.qualifiedFilename) + '.css'
			# Pass sources for compilers
			opts = {sources: @fileCache.locations.concat()}
			file.getContents opts, (err, content) =>
				# Error compiling
				err and notify.error(err)
				# Lint
				@_lint(content, filepath) if lint
				# Compress
				if compress
					@_compress content, filepath, (err, content) =>
						# Error compressing
						err and notify.error(err)
						# Output to file
						@_writeFile(content, filepath)
				else
					# Output to file
					@_writeFile(content, filepath)

	# Write file 'contents' to the specified 'filepath' location
	# @param {String} content
	# @param {String} filepath
	_writeFile: (content, filepath) ->
		# Create directory if missing
		mkdir(filepath)
		notify.print("#{notify.colour('built', notify.GREEN)} #{notify.strong(path.basename(filepath))}", 3)
		fs.writeFileSync(filepath, content, 'utf8')