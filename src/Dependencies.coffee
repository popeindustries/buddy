path = require('path')
fs = require('fs')
bower = require('bower')
rimraf = require('rimraf')
{mv, cp, mkdir, cat, notify} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

RE_ID = /\D\[\d{2}m([\w-_]+)\D\[\d{2}m$/

module.exports = class Dependencies

	# Constructor
	# @param {Object} options
	# @param {Object} compressor
	constructor: (@options, @compressor) ->
		@installIdx = 0
		@dependencies = []
		@files = []
		for destination, data of @options
			data.sources.forEach (source) =>
				# Handle local files
				if /^[\.\/~]/.test(source)
					id = source
					source = path.resolve(source)
					local = true
				# Strip specified source path
				if /@/.test(source)
					items = source.split('@')
					source = items[0]
					sourcePath = items[1]
				@dependencies.push
					destination: destination
					source: source
					sourcePath: sourcePath or ''
					output: data.output and path.resolve(data.output)
					local: local or false
					id: id
					filepath: ''

	# Install dependencies and call 'fn' when complete
	# @param {Function} fn(err, files)
	install: (fn) ->
		next = (dependency) =>
			@installIdx++
			@_moveSource(dependency)
			@install(fn)

		if dependency = @dependencies[@installIdx]
			if dependency.local
				next(dependency)
			else
				bower.commands
					.install([dependency.source])
					# Derive id from message string (don't overwrite in case of dependants)
					.on('data', (data) => dependency.id ?= RE_ID.exec(data)[1] if /fetching/.test(data))
					.on('end', => next(dependency))
					.on('error', (err) -> fn(err))
		# Complete
		else
			@installIdx = 0
			@_resolveDependants(fn)

	clean: ->
		# Clear bower cache
		bower.commands['cache-clean']

	# Move dependency files from temp location to destination
	# @param {Object} dependency
	_moveSource: (dependency) ->
		mkdir(path.resolve(dependency.destination))
		# Copy local sources
		if dependency.local
			cp(dependency.source, path.resolve(dependency.destination))
			@files.push(path.resolve(dependency.destination, path.basename(dependency.source)))
		else
			# parse component.json for this dependency
			filepath = path.resolve(process.cwd(), 'components', dependency.id)
			component = JSON.parse(fs.readFileSync(path.resolve(filepath, 'component.json'), 'utf8'))
			# move source files to destination
			filepath = path.resolve(filepath, dependency.sourcePath or component.main or '')
			dependency.filepath = path.resolve(process.cwd(), dependency.destination, path.basename(filepath))
			mv(filepath, path.resolve(dependency.destination))
			@files.push(path.resolve(dependency.destination, path.basename(filepath)))
		notify.print("#{notify.colour('installed', notify.GREEN)} #{notify.strong(dependency.id)} to #{notify.strong(dependency.destination)}", 3)

	# Check if dependants of our specified dependencies have been installed
	# @param {Function} fn(err, files)
	_resolveDependants: (fn) ->
		# List all installed sources
		bower.commands
			.list({map: true})
			.on('data', (data) =>
				for item, props of data
					# Get dependency object
					dependency = @dependencies.filter((d) -> d.id is item)[0]
					# Handle dependants of dependency
					if props.dependencies
						for depItem of props.dependencies
							# Create new dependency object for dependant
							dependant =
								destination: dependency.destination
								output: dependency.output
								id: depItem
							# Move source
							@_moveSource(dependant)
							# Insert dependant before dependency
							@dependencies.splice(@dependencies.indexOf(dependency), 0, dependant)
				@_clearCache()
				@_pack(fn)
			)
			.on('error', (err) -> fn(err))

	# Clear the temporary components directory
	_clearCache: ->
		rimraf.sync(path.resolve('components'))

	# Package dependencies into single output file if necessary
	# @param {Function} fn(err, files)
	_pack: (fn) ->
		outputs = {}
		# Collect outputable dependencies
		outputable = @dependencies.filter((dependency) -> dependency.output)
		if outputable.length
			outputable.forEach (dependency) ->
				outputs[dependency.output] ?= []
				outputs[dependency.output].push(dependency.filepath)
			# Concat, compress, and write file
			n = Object.keys(outputs).length
			i = 0
			for output, files of outputs
				# Concat
				contents = []
				files.forEach((file) -> contents.push(fs.readFileSync(file)))
				content = contents.join('\n')
				mkdir(output)
				# Compress
				@compressor.compress content, (err, content) =>
					# Error compressing
					if err
						fn(err, @files)
					else
						notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.basename(output))}", 3)
						fs.writeFileSync(output, content)
						@files.push(output)
						fn(null, @files) if ++i is n
		else
			fn(null, @files)
