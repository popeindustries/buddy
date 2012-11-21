path = require('path')
fs = require('fs')
events = require('events')
bower = require('bower')
request = require('superagent')
http = require('http')
unzip = require('unzip')
{rm, mv, cp, mkdir, notify} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

RE_GITHUB_PROJECT = /\w+\/\w+/
RE_GITHUB_URL = /git:\/\/(.*)\.git/
RE_PACKAGE_NOT_FOUND = /was not found/

module.exports = class Dependency extends events.EventEmitter

	# Constructor
	# @param {String} source
	# @param {String} destination
	# @param {String} output
	constructor: (source, destination, output) ->
		@local = false
		@id = source
		@url = null
		@version = 'master'
		@resources = null
		@location = null
		# @filepaths = []
		@destination = path.resolve(destination)
		@output = output and path.resolve(output)
		# Don't clean if source is in destination dir
		@keep = source.indexOf(path.resolve(destination)) isnt -1

		# Local
		if existsSync(path.resolve(source))
			@local = true
			@location = source
		# Remote
		else
			# Parse specified resources
			source = source.split('#')
			@resources = source[1].split('|') if source[1]
			# Parse version
			source = source[0].split('@')
			@version = source[1] if source[1]
			@id = source[0]
			# github user/project
			if RE_GITHUB_PROJECT.test(@id)
				@url = "https://github.com/#{@id}/archive/#{@version}.zip"
				@id = @id.split('/')[1]

	# Lookup a Bower package's github location
	lookupPackage: ->
		bower.commands
			.lookup(@id)
			# Error looking up package
			.on('error', => @emit('error', 'no package found for:' + @id))
			.on 'data', (data) =>
				# Error looking up package
				if RE_PACKAGE_NOT_FOUND.test(data)
					@emit('error', 'no package found for:' + @id)
				else
					# Store archive url
					@url = "https://#{RE_GITHUB_URL.exec(data)[1]}/archive/#{@version}.zip"
					@emit('end')
		@

	# Fetch the github archive zipball to 'temp' directory
	# @param {String} dest
	fetch: (temp) ->
		# Create archive filename
		filename = temp + '/' + @id + '-' + @version + '.zip'
		# Download archive to temp
		req = request.get(@url).buffer(false)
		req.end (err, res) =>
			# Error downloading
			if err or res.error
				@emit('error', 'fetching ' + @url + ' failed with error code: ' + http.STATUS_CODES[res.status])
			else
				# Write to disk
				res.pipe(fs.createWriteStream(filename))
				res.on 'end', =>
					# Unzip
					fs.createReadStream(filename).pipe(unzip.Extract({path: temp}))
					# Error unzipping
					.on('error', => @emit('error', 'unzipping archive: ' + filename))
					# Store path to unzipped package
					.on 'close', =>
						@location = filename.replace(path.extname(filename), '')
						@emit('end')
		@

	# Parse archive component.json or package.json for resources and dependencies
	resolveResources: ->
		add: (filename) =>
			filepath = path.resolve(@location, filename)
			@resources.push(filepath) if existsSync(filepath)

		unless @resources
			# Find json file
			if existsSync(@location + '/component.json')
				config = '/component.json'
			else if existsSync(@location + '/package.json')
				config = '/package.json'
			else
				return @emit('error', 'no config (component/package).json file found for: ' + @id)

			json = JSON.parse(fs.readfileSync(@location + config))

			# Find dependencies and notify
			if json.dependencies
				for dependency, version of json.dependencies
					@emit('dependency', dependency, version)

			@resources = []
			# Find files specified in 'scripts' or 'main'
			if json.scripts
				json.scripts.forEach((filename) -> add(filename))
			else if json.main
				add(json.main)
			else
				return @emit('error', 'unable to resolve resources for: ' + @id)
			@emit('end')
		@

	move: ->
		mkdir(path.resolve(@destination))
		if @local
			@filepath = path.resolve(@destination, @url)
			cp(path.normalize(process.cwd(), @url), @destination)
		# @files.push(@filepath) unless @keep
		# notify.print("#{notify.colour('installed', notify.GREEN)} #{notify.strong(@id)} to #{notify.strong(@destination)}", 3)
		@
