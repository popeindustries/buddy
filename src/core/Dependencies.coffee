path = require('path')
fs = require('fs')
async = require('async')
Dependency = require('./dependency')
{rm, mv, cp, mkdir, notify, existsSync} = require('../utils/utils')

module.exports = class Dependencies

	# Constructor
	# @param {Object} options
	# @param {Object} compressor
	constructor: (@options, @compressor) ->
		@dependencies = []
		@childDependencies = []
		@files = []
		@temp = path.resolve('.tmp')
		for destination, data of @options
			data.sources.forEach (source) =>
				@dependencies.push(new Dependency(source, destination, data.output, @temp))

	# Install dependencies and call 'fn' when complete
	# @param {Function} fn(err, files)
	install: (fn) ->
		# Create temp directory to store archive downloads
		mkdir @temp, (err) =>
			return fn(err) if err
			# Install
			async.forEach @dependencies, @_installDependency, (err) =>
				# All errors demoted to warnings
				# Install child dependencies
				# TODO: check that deeply nested child dependencies are installed
				if @childDependencies.length
					async.forEach @childDependencies, @_installDependency, (err) =>
						# Add child dependencies before parents
						@dependencies = @childDependencies.concat(@dependencies)
						@_pack (err) => fn(err, @files)
				else
					@_pack (err) => fn(err, @files)

	# Install a dependency
	# @param {Dependency} dependency
	# @param {Function} fn(err)
	_installDependency: (dependency, fn) =>
		dependency.install (err, dependencies) =>
			if err
				# Error installing (non-critical)
				notify.warn(err)
				# Remove and destroy
				@dependencies.splice(@dependencies.indexOf(dependency), 1)
				dependency.destroy()
			else
				# Store dependencies
				if dependencies.length
					dependencies.forEach (source) =>
						@childDependencies.push(new Dependency(source, dependency.destination, dependency.output, @temp))
				notify.print("#{notify.colour('installed', notify.GREEN)} #{notify.strong(dependency.id)} to #{notify.strong(path.relative(process.cwd(), dependency.destination))}", 3)
				# Store generated file references
				@files = @files.concat(dependency.files)
				fn()

	# Package dependencies into single output file if necessary
	# @param {Function} fn(err)
	_pack: (fn) =>
		# Delete temp
		rm @temp, (err) =>
			# Warn if error deleting temp
			notify.warn(err) if err
			# Collect outputable dependencies
			outputs = {}
			outputable = @dependencies.filter((dependency) -> dependency.output)
			if outputable.length
				outputable.forEach (dependency) ->
					outputs[dependency.output] ?= []
					outputs[dependency.output] = outputs[dependency.output].concat(dependency.resources)
				# Concat, compress, and write each output file
				for output, files of outputs
					async.map files, fs.readFile, (err, contents) =>
						return err if err
						content = contents.join('\n')
						async.waterfall [
							# Create directory
							((cb) -> mkdir output, cb),
							# Compress
							((cb) => @compressor.compress content, cb),
							# Write file
							((content, cb) => fs.writeFile output, content, 'utf8', cb),
							# Notify and store generated
							((cb) =>
								notify.print("#{notify.colour('compressed', notify.GREEN)} #{notify.strong(path.relative(process.cwd(), output))}", 3)
								@files.push(output)
								cb()
							)
						# Return with error
						], fn
			else
				fn()
