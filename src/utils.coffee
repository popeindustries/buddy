fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

# Console output formatting
exports.notify =
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
# @param {Regex} ignore
# @param {Array} files
# @return {Array}
exports.readdir = readdir = (dir, ignore = /^\./, files = []) ->
	fs.readdirSync(dir).forEach (item) =>
		# Skip ignored files
		unless ignore.test(path.basename(item))
			itempath = path.resolve(dir, item)
			if fs.statSync(itempath).isDirectory()
				# Recurse child directory
				readdir(itempath, ignore, files)
			else
				files.push(itempath)
	files

# Recursively create directory path specified by 'filepath'
# @param {String} filepath
exports.mkdir = mkdir = (filepath) ->
	# Resolve directory name if passed a file
	dir = if path.extname(filepath) then path.dirname(filepath) else filepath
	mkdirp.sync(dir) unless existsSync(dir)

# Move file or directory 'source' to 'destination'
# @param {String} source
# @param {String} destination
exports.mv = mv = (source, destination) ->
	try
		fs.rename(source, path.resolve(destination, path.basename(source)))
	catch err
		# pipe files

# Copy file or directory 'source' to 'destination'
# @param {String} source
# @param {String} destination
# @param {String} base [private]
exports.cp = cp = (source, destination, base = null) ->
	# File
	if fs.statSync(source).isFile()
		fs.writeFileSync(path.resolve(destination, path.basename(source)), fs.readFileSync(source))
	# Directory
	else
		# Copy contents only if source ends in '/'
		contentsOnly = if source.charAt(source.length - 1) is '/' and not base then true else false
		base = if contentsOnly then path.resolve(source) else path.dirname(path.resolve(source))
		dir = path.resolve(destination, source.replace(base, destination))
		# Create in destination
		fs.mkdirSync(dir) unless existsSync(dir)
		# Loop through contents
		fs.readdirSync(source).forEach (item) => cp(path.resolve(source, item), dir, base)

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
