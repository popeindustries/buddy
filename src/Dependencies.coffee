path = require('path')
fs = require('fs')
Dependency = require('./dependency')
{rm, mv, cp, mkdir, notify, existsSync} = require('./utils')

module.exports = class Dependencies

	# Constructor
	# @param {Object} options
	# @param {Object} compressor
	constructor: (@options, @compressor) ->
		@installIdx = 0
		@dependencies = []
		@files = []
		@temp = path.resolve('.tmp')
		for destination, data of @options
			data.sources.forEach (source) =>
				@dependencies.push(new Dependency(source, destination, data.output))

	# Install dependencies and call 'fn' when complete
	# @param {Function} fn(err, files)
	install: (fn) ->
		# TODO: async mkdir
		# Create temp directory to store downloads
		mkdir(@temp)
		@dependencies.forEach (dependency) =>
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
			@_installDependency(dependant, fn)
		.once 'end', =>
			notify.print("#{notify.colour('installed', notify.GREEN)} #{notify.strong(dependency.id)} to #{notify.strong(dependency.destination)}", 3)
			@files = @files.concat(dependency.files)
			@installIdx++
			@_pack(fn) if @installIdx is @dependencies.length

	# Package dependencies into single output file if necessary
	# @param {Function} fn(err, files)
	_pack: (fn) ->
		# TODO: async rm
		# Delete temp
		rm(@temp)
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
			for output, files of outputs
				# TODO: async readFile
				# Concat
				contents = files.map((file) -> fs.readFileSync(file))
				content = contents.join('\n')
				# TODO: async mkdir
				mkdir(output)
				# Compress
				@compressor.compress content, (err, content) =>
					# Error compressing
					if err
						fn(err, @files)
					else
						notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.relative(output))}", 3)
						# TODO: async writeFile
						fs.writeFileSync(output, content)
						@files.push(output)
						fn(null, @files) if ++i is n
		else
			fn(null, @files)
