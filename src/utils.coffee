fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')
rimraf = require('rimraf')
# Node 0.8.0 api change
exports.existsSync = existsSync = fs.existsSync or path.existsSync
exports.exists = exists = fs.exists or path.exists

RE_IGNORE = /^[\.~]|~$/

# Console output formatting
exports.notify = notify =
	RED: '0;31'
	YELLOW: '1;33'
	GREEN: '0;32'
	GREY: '0;90'

	silent: false

	nocolor: !process.stdout.isTTY

	# Add TTY colours to given 'string'
	# @param {String} string
	# @param {String} colourCode
	colour: (string, colourCode) ->
		return if @nocolor then string else `'\033[' + colourCode + 'm' + string + '\033[0m'`

	# Print 'msg' to console, with indentation level
	# @param {String} msg
	# @param {Int} ind
	print: (msg, ind = 1) ->
		console.log(exports.indent(msg, ind)) unless @silent

	# Print 'err' to console, with error colour and indentation level
	# @param {Object or String} err
	# @param {Int} ind
	error: (err, ind = 1) ->
		err = new Error(err) if 'string' is typeof err
		@print("#{@colour('error', @RED)}: #{err.message}", ind)
		throw err

	# Print 'msg' to console, with warning colour and indentation level
	# @param {String} msg
	# @param {Int} ind
	warn: (msg, indent = 1) ->
		@print("#{@colour('warning', @YELLOW)} #{msg}", indent)

	# Colourize 'string' for emphasis
	# @param {String} string
	strong: (string) ->
		@colour(string, @GREY)

# Read and store the contents of a directory, ignoring files of type specified
# @param {String} dir
# @param {Function} fn(err, files)
# @param {Regex} ignore
exports.readdir = readdir = (dir, fn, ignore) ->
	# Merge ignores
	ignore = if ignore then new RegExp(RE_IGNORE.source + '|' + ignore.source) else RE_IGNORE
	_outstanding = 0
	_files = []
	_readdir = (dir) ->
		_outstanding++
		fs.readdir dir, (err, files) ->
			_outstanding--
			if err
				# Exit if proper error, otherwise skip
				return if err.code is 'ENOENT'
				else return fn(err)
			else
				files.forEach (file) ->
					# Skip ignored files
					unless ignore.test(path.basename(file))
						filepath = path.resolve(dir, file)
						_outstanding++
						fs.stat filepath, (err, stats) ->
							_outstanding--
							if err
								# Exit if proper error, otherwise skip
								return if err.code is 'ENOENT'
								else return fn(err)
							else
								# Recurse child directory
								if stats.isDirectory()
									_readdir(filepath)
								else
									# Store
									_files.push(filepath)
									# Return if no outstanding
									fn(null, _files) unless _outstanding
				# Return if no outstanding
				fn(null, _files) unless _outstanding
	_readdir(dir)

# Recursively create directory path specified by 'filepath'
# @param {String} filepath
# @param {Function} fn(err)
exports.mkdir = mkdir = (filepath, fn) ->
	# Resolve directory name if passed a file
	dir = if path.extname(filepath) then path.dirname(filepath) else filepath
	unless existsSync(dir)
		mkdirp dir, (err) ->
			if err then fn(err) else fn()
	else
		fn()

# Move file or directory 'source' to 'destination'
# @param {String} source
# @param {String} destination
# @param {Function} fn(err, filepath)
exports.mv = mv = (source, destination, fn) ->
	mkdir destination, (err) ->
		if err
			fn(err)
		else
			filepath = path.resolve(destination, path.basename(source))
			if existsSync(filepath)
				fn(new Error('already exists: ' + filepath))
			else
				fs.rename source, filepath, (err) ->
					if err then fn(err) else fn(null, filepath)

# Copy file or directory 'source' to 'destination'
# Copies contents of 'source' if directory and ends in trailing '/'
# @param {String} source
# @param {String} destination
# @param {Function} fn(err, filepath)
exports.cp = cp = (source, destination) ->
	_outstanding = 0
	_base =
	_cp = (source, destination) ->



	# File
	if fs.statSync(source).isFile()
		# Same directory
		if path.dirname(source) is path.dirname(destination)
			if path.basename(destination) and path.basename(destination) isnt path.basename(source)
				filename = destination
			else
				# Append 'copy' if no destination filename
				filename = source.replace('.', ' copy.')
		# New directory
		else
			filename = path.resolve(destination, path.basename(source))
		# Write file if it doesn't already exist
		fs.writeFileSync(filename, fs.readFileSync(source)) unless existsSync(filename)
		return filename
	# Directory
	else
		# Copy contents only if source ends in '/'
		contentsOnly = if source.charAt(source.length - 1) is '/' and not base then true else false
		base = if contentsOnly then path.resolve(source) else path.dirname(path.resolve(source))
		dir = path.resolve(destination, source.replace(base, destination))
		# Create in destination
		mkdir(dir)
		# Loop through contents
		fs.readdirSync(source).forEach (item) => cp(path.resolve(source, item), dir, base)
		return dir

# Recursive remove file or directory
# Makes sure only project sources are removed
# @param {String} source
# @param {Function} fn(err)
exports.rm = rm = (source, fn) ->
	if existsSync(source)
		if source.indexOf(process.cwd()) isnt -1
			rimraf source, (err) ->
				if err then fn(err) else fn()
		else
			fn(new Error('cannot rm source outside of project path: ' + source))
	else
		fn(new Error('cannot rm non-existant source: ' + source))

# Indent the given 'string' a specific number of spaces
# @param {String} string
# @param {Int} level
exports.indent = (string, level) ->
	re = /^/gm
	string = string.replace(re, (new Array(level)).join('  '))
	string

# setTimeout wrapper
# @param {int} time
# @param {Function} fn
exports.wait = (time = 25, fn) ->
	return setTimeout(fn, time)
