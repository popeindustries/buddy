path = require('path')
fs = require('fs')
bower = require('bower')
request = require('superagent')
http = require('http')
unzip = require('unzip')
semver = require('semver')
async = require('async')
{rm, mv, cp, mkdir, notify, existsSync} = require('../utils/utils')

RE_GITHUB_PROJECT = /\w+\/\w+/
RE_GITHUB_URL = /git:\/\/(.*)\.git/
RE_PACKAGE_NOT_FOUND = /was not found/
RE_INDEX = /^index(?:\.js$)?/
RE_VALID_VERSION = /^\d+\.\d+\.\d+$|^master$/

module.exports = class Dependency

	# Constructor
	# @param {String} source
	# @param {String} destination
	# @param {String} output
	# @param {String} temp
	constructor: (source, destination, output, @temp) ->
		@local = false
		@keep = false
		@id = source
		@name = source
		@url = null
		@version = 'master'
		@location = null
		@resources = null
		@files = []
		@dependencies = []
		@destination = path.resolve(destination)
		@output = output and path.resolve(output)

		# Parse specified resources
		source = source.split('#')
		@resources = source[1].split('|') if source[1]
		# Local
		if existsSync(path.resolve(source[0]))
			@local = true
			@location = path.resolve(source[0])
			@resources ?= [@location]
			# Don't clean if source is in destination dir
			@keep = @location.indexOf(path.resolve(@destination)) isnt -1
		# Remote
		else
			# Parse version
			source = source[0].split('@')
			@version = source[1] if source[1]
			@id = @name = source[0]
			# github user/repo
			if RE_GITHUB_PROJECT.test(@name)
				@url = "https://github.com/#{@name}/archive/#{@version}.zip"
				@id = @name.split('/')[1]

	# Install the dependency
	# @param {Function} fn(err, dependencies)
	install: (fn) ->
		# Copy local files
		if @local
			@move (err) =>
				if err then fn(err) else fn(null, @dependencies)
		# Retrieve remote files
		else
			async.series [
				@lookupPackage,
				@validateVersion,
				@fetch,
				@resolveResources,
				@move
			], (err) =>
				if err then fn(err) else fn(null, @dependencies)

	# Lookup a Bower package's github location
	# @param {Function} fn(err)
	lookupPackage: (fn) =>
		unless @url
			bower.commands
				.lookup(@id)
				# Error looking up package
				.on('error', => fn('no package found for:' + @id))
				.on 'data', (data) =>
					# Error looking up package
					if RE_PACKAGE_NOT_FOUND.test(data)
						fn('no package found for:' + @id)
					else
						# Store archive url
						url = RE_GITHUB_URL.exec(data)[1]
						@name = url.replace('github.com/', '')
						@url = "https://#{url}/archive/#{@version}.zip"
						fn()
		else
			# Delay for event chaining
			process.nextTick(-> fn())

	# Retrieve the latest version that satisfies a conditional version number
	# @param {Function} fn(err)
	validateVersion: (fn) =>
		unless RE_VALID_VERSION.test(@version)
			# Get tags
			req = request.get("https://api.github.com/repos/#{@name}/tags")
			req.end (err, res) =>
				# Error downloading
				if err or res.error
					fn('fetching tags for: ' + @name + ' failed with error code: ' + http.STATUS_CODES[res.status])
				else
					# Parse and sort json data
					try
						json = JSON.parse(res.text)
					catch err
						fn('parsing tag information for: ' + @name)
					# Sort by version (name) descending
					json.sort((a, b) -> semver.rcompare(a.name, b.name))

					# Set latest version
					if @version is '*' or @version is 'latest'
						@version = json[0].name
						@url = json[0].zipball_url
					# Match version
					else
						for version in json
							# Find the highest version that passes
							if semver.satisfies(version.name, @version)
								@version = version.name
								@url = version.zipball_url
								break
					fn()
		else
			# Delay for event chaining
			process.nextTick(-> fn())

	# Fetch the github archive zipball to 'temp' directory
	# @param {Function} fn(err)
	fetch: (fn) =>
		# Create archive filename
		filename = @temp + path.sep + @id + '-' + @version + '.zip'
		# Download archive to temp
		req = request.get(@url).buffer(false)
		req.end (err, res) =>
			# Error downloading
			if err or res.error
				fn('fetching ' + @url + ' failed with error code: ' + http.STATUS_CODES[res.status])
			else
				# Write to disk
				res.pipe(fs.createWriteStream(filename))
				res.on 'end', =>
					# Unzip
					extractor = unzip.Extract({path: @temp})
					fs.createReadStream(filename).pipe(extractor)
					# Error unzipping
					extractor.on('error', => fn('unzipping archive: ' + filename))
					# Store path to unzipped package
					extractor.on 'close', =>
						@location = filename.replace(path.extname(filename), '')
						fn()

	# Parse archive component.json or package.json for resources and dependencies
	# @param {Function} fn(err)
	resolveResources: (fn) =>
		add = (filename) =>
			# Rename if index
			if RE_INDEX.test(filename)
				filename += '.js' unless path.extname(filename)
				newname = @id + '.js'
				# TODO: async rename
				fs.renameSync(path.resolve(@location, filename), path.resolve(@location, newname))
				filename = newname
			filepath = path.resolve(@location, filename)
			@resources.push(filepath) if existsSync(filepath)

		if @resources
			# Store resources with absolute paths
			temp = @resources.concat()
			@resources = []
			temp.forEach((filename) -> add(filename))
			# Delay for event chaining
			process.nextTick(-> fn())
		else
			@resources = []
			# Find json file
			if existsSync(path.resolve(@location, 'component.json'))
				config = 'component.json'
			else if existsSync(path.resolve(@location, 'package.json'))
				config = 'package.json'
			else
				return fn('no config (component/package).json file found for: ' + @id)

			fs.readFile path.resolve(@location, config), 'utf8', (err, data) =>
				return fn('reading: ' + @id + ' ' + config) if err
				try
					json = JSON.parse(data)
				catch err
					return fn('parsing: ' + @id + ' ' + config)

				# Find dependencies and store
				if json.dependencies
					for dependency, version of json.dependencies
						@dependencies.push("#{dependency}@#{version}")

				# Find files specified in 'scripts' or 'main'
				if json.scripts
					json.scripts.forEach((filename) -> add(filename))
				else if json.main
					add(json.main)
				else
					return fn('unable to resolve resources for: ' + @id)
				fn(null)

	# Move resources to destination
	# @param {Function} fn(err)
	move: (fn) =>
		unless @keep
			idx = -1
			async.forEachSeries @resources, ((resource, cb) =>
				# Copy local files, otherwise move
				require('./utils')[if @local then 'cp' else 'mv'] resource, @destination, (err, filepath) =>
					return cb(err) if err
					idx++
					@files.push(path.relative(process.cwd(), filepath))
					@resources[idx] = filepath
					cb()
				), (err) =>
					if err then fn(err) else fn()
		else
			# Delay for event chaining
			process.nextTick(-> fn())

	destroy: ->
