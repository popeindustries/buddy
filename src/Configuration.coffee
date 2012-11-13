fs = require('fs')
path = require('path')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync
{notify} = require('./utils')

DEFAULT = 'buddy.js'

module.exports = class Configuration

	# Constructor
	# Accepts optional path to configuration file or directory
	# @param {String} url
	constructor: (@url = '') ->
		@build = null
		@dependencies = null
		@settings = null

	# Locate the configuration file
	# Walks the directory tree if no file/directory specified
	locate: ->
		if @url
			# Check that the supplied path is valid
			@url = path.resolve(@url)
			if exists = existsSync(@url)
				# Try default file name if passed directory
				if fs.statSync(@url).isDirectory()
					@url = path.join(@url, DEFAULT)
					exists = existsSync(@url)
			unless exists
				notify.error("#{notify.strong(path.basename(@url))} not found in #{notify.strong(path.dirname(@url))}", 2)
		else
			# Find the first instance of a DEFAULT file based on the current working directory.
			while true
				if dir?
					parent = path.resolve(dir, '../')
					# Exit if we reach the volume root without finding our file
					if parent is dir
						notify.error("#{notify.strong(DEFAULT)} not found on this path", 2)
					else
						dir = parent
				else
					# Start at current working directory
					dir = process.cwd()
				@url = path.join(dir, DEFAULT)
				break if existsSync(@url)
		# Set current directory to location of file
		process.chdir(path.dirname(@url))
		@

	# Load and parse configuration file
	load: ->
		notify.print("loading config #{notify.strong(@url)}", 2)
		try
			data = require(@url)
			if data.build or data.dependencies or data.settings
				@build = data.build
				@dependencies = data.dependencies
				@settings = data.settings
			else
				throw ''
		catch err
			notify.error("parsing #{notify.strong(@url)}\n  Run #{notify.strong('buddy -h')} for proper formatting", 2)
		@
