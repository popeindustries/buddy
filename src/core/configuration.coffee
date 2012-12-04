fs = require('fs')
path = require('path')
{existsSync} = require('../utils/fs')
{debug, strong} = require('../utils/notify')

DEFAULT = 'buddy.js'
DEFAULT_JSON = 'buddy.json'

exports.data = null
exports.url = ''

# Load and parse configuration file
# Accepts optional path to file or directory
# @param {String} url
# @param {Function} fn(err, config)
exports.load = (url, fn) ->
	debug('CONFIGURATION', 1)
	locate url, (err) ->
		return fn(err) if err
		try
			data = require(exports.url)
		catch err
			return fn("parsing #{strong(exports.url)}\n  Run #{strong('buddy -h')} for proper formatting")
		if data.build or data.dependencies or data.settings
			# Store
			exports.data = data
			# Set current directory to location of file
			process.chdir(path.dirname(exports.url))
			return fn(null, data)
		else
			return fn("parsing #{strong(exports.url)}\n  Run #{strong('buddy -h')} for proper formatting")

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
					# Support both js and json file types
					urljs = path.join(url, DEFAULT)
					urljson = path.join(url, DEFAULT_JSON)
					if existsSync(url = urljs) or existsSync(url = urljson)
						debug("config file found at: #{strong(url)}", 2)
						exports.url = url
						fn(null, url)
					else
						return fn("#{strong(path.basename(url))} not found in #{strong(path.dirname(url))}")
				else
					debug("config file found at: #{strong(url)}", 2)
					exports.url = url
					fn(null, url)
		else
			return fn("#{strong(path.basename(url))} not found in #{strong(path.dirname(url))}")
	# No url specified
	# Find the first instance of a DEFAULT file based on the current working directory.
	else
		while true
			if dir?
				parent = path.resolve(dir, '../')
				# Exit if we can no longer go up a level
				if parent is dir
					return fn("#{strong(DEFAULT)} not found on this path")
				else
					dir = parent
			else
				# Start at current working directory
				dir = process.cwd()
			# Support both js and json file types
			urljs = path.join(dir, DEFAULT)
			urljson = path.join(dir, DEFAULT_JSON)
			if existsSync(url = urljs) or existsSync(url = urljson)
				debug("config file found at: #{strong(url)}", 2)
				exports.url = url
				return fn(null)
