fs = require('fs')
path = require('path')
{existsSync} = require('../utils/fs')
notify = require('../utils/notify')

DEFAULT = 'buddy.js'

# Load and parse configuration file
# Accepts optional path to file or directory
# @param {String} url
# @param {Function} fn(err, config)
exports.load = (url, fn) ->
	locate url, (err, url) ->
		return fn(err) if err
		try
			data = require(url)
		catch err
			return fn("parsing #{notify.strong(url)}\n  Run #{notify.strong('buddy -h')} for proper formatting")
		if data.build or data.dependencies or data.settings
			# Set current directory to location of file
			process.chdir(path.dirname(url))
			return fn(null, data)
		else
			return fn("parsing #{notify.strong(url)}\n  Run #{notify.strong('buddy -h')} for proper formatting")

# Locate the configuration file
# Walks the directory tree if no file/directory specified
# @param {Function} fn(err, url)
exports.locate = locate = (url, fn) ->
	if url
		# Check that the supplied path is valid
		url = path.resolve(url)
		if existsSync(url)
			fs.stat url, (err, stats) ->
				return fn(err) if err
				# Try default file name if passed directory
				if not path.extname(url).length or stats.isDirectory()
					url = path.join(url, DEFAULT)
					if existsSync(url)
						fn(null, url)
					else
						return fn("#{notify.strong(path.basename(url))} not found in #{notify.strong(path.dirname(url))}")
				else
					fn(null, url)
		else
			return fn("#{notify.strong(path.basename(url))} not found in #{notify.strong(path.dirname(url))}")
	# No url specified
	# Find the first instance of a DEFAULT file based on the current working directory.
	else
		while true
			if dir?
				parent = path.resolve(dir, '../')
				# Exit if we can no longer go up a level
				if parent is dir
					return fn("#{notify.strong(DEFAULT)} not found on this path")
				else
					dir = parent
			else
				# Start at current working directory
				dir = process.cwd()
			url = path.join(dir, DEFAULT)
			return fn(null, url) if existsSync(url)
