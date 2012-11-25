path = require('path')
fs = require('fs')
Dependency = require('./dependency')
{rm, mv, cp, mkdir, notify, existsSync} = require('./utils')

module.exports = class Dependencies

	# Constructor
	# @param {Object} options
	# @param {Object} compressor
	constructor: (@options, @compressor) ->
		@_outstanding = 0
		@dependencies = []
		@files = []
		@temp = path.resolve('.tmp')
		for destination, data of @options
			data.sources.forEach (source) =>
				@dependencies.push(new Dependency(source, destination, data.output))

	# Install dependencies and call 'fn' when complete
	# @param {Function} fn(err, files)
	install: (fn) ->
		# Create temp directory to store downloads
		mkdir @temp, (err) =>
			if err
				notify.error(err)
			else
				@dependencies.forEach (dependency) =>
					@_outstanding++
					@_installDependency(dependency, fn)

	# Install a dependency
	# @param {Dependency} dependency
	# @param {Function} fn(err, files)
	_installDependency: (dependency, fn) ->
		dependency.install(@temp)
		.once 'error', (err) =>
			# Error installing
			# non-critical
			notify.warn(err)
			# Remove and destroy
			@dependencies.splice(@dependencies.indexOf(dependency), 1)
			dependency.destroy()
		.on 'dependency', (source) =>
			# Create new dependency
			dependant = new Dependency(source, dependency.destination, dependency.output)
			# Insert before parent
			@dependencies.splice(@dependencies.indexOf(dependency), 0, dependant)
			# Install
			@_outstanding++
			@_installDependency(dependant, fn)
		.once 'end', =>
			@_outstanding--
			notify.print("#{notify.colour('installed', notify.GREEN)} #{notify.strong(dependency.id)} to #{notify.strong(path.relative(process.cwd(), dependency.destination))}", 3)
			@files = @files.concat(dependency.files)
			@_pack(fn) unless @_outstanding

	# Package dependencies into single output file if necessary
	# @param {Function} fn(err, files)
	_pack: (fn) ->
		# Delete temp
		rm @temp, (err) =>
			if err
				notify.error(err)
			else
				# Collect outputable dependencies
				outputs = {}
				outputable = @dependencies.filter((dependency) -> dependency.output)
				if outputable.length
					outputable.forEach (dependency) ->
						outputs[dependency.output] ?= []
						outputs[dependency.output] = outputs[dependency.output].concat(dependency.resources)
					# Concat, compress, and write file
					n = Object.keys(outputs).length
					i = 0
					outstanding = 0
					contents = []
					for output, files of outputs
						files.forEach (file) =>
							outstanding++
							fs.readFile file, (err, data) =>
								outstanding--
								if err
									fn(err, @files)
								else
									contents.push(data)
									unless outstanding
										# Concat
										content = contents.join('\n')
										mkdir output, (err) =>
											if err
												fn(err, @files)
											else
												# Compress
												@compressor.compress content, (err, content) =>
													# Error compressing
													if err
														fn(err, @files)
													else
														fs.writeFile output, content, 'utf8', (err) =>
															if err
																fn(err, @files)
															else
																notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), output))}", 3)
																@files.push(output)
																fn(null, @files) if ++i is n
				else
					fn(null, @files)
