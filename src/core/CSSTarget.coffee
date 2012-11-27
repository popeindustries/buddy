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
	# @param {Function} fn(err, files)
	_build: (compress, lint, fn) ->
		n = @sources.length
		@sources.forEach (file, idx) =>
			# Resolve output name
			filepath = if path.extname(@output).length then @output else path.join(@output, file.qualifiedFilename) + '.css'
			# Pass sources for compilers
			opts = {sources: @fileCache.locations.concat()}
			file.getContents opts, (err, content) =>
				# Error compiling
				if err
					fn(err)
				else
					# Lint
					@_lint(content, filepath) if lint
					# Compress
					if compress
						@_compress content, filepath, (err, content) =>
							# Error compressing
							if err
								fn(err)
							else
								# Output to file
								@_writeFile(content, filepath, fn, idx + 1 is n)
					else
						# Output to file
						@_writeFile(content, filepath, fn, idx + 1 is n)

	# Write file 'contents' to the specified 'filepath' location
	# @param {String} content
	# @param {String} filepath
	# @param {Function} fn(err, files)
	# @param {Boolean} exit
	_writeFile: (content, filepath, fn, exit) ->
		# TODO: async mkdir, writeFile
		# Create directory if missing
		mkdir(filepath)
		fs.writeFileSync(filepath, content, 'utf8')
		@files.push(filepath)
		notify.print("#{notify.colour('built', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), filepath))}", if @watching then 4 else 3)
		fn(null, @files) if exit