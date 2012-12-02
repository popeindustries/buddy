fs = require('fs')
path = require('path')
{existsSync} = require('./fs')
{debug, strong} = require('./notify')

NAME = '.buddy-filelog'
RE_ABSOLUTE = /^([a-z]:\\)|^\//i

exports.filename = null

exports.files = []

# Load existing
# @param {Function} fn(err)
exports.load = (fn) ->
	exports.filename = path.resolve(NAME)
	if existsSync(exports.filename)
		fs.readFile exports.filename, 'utf8', (err, data) ->
			return fn(err) if err
			try
				exports.files = JSON.parse(data)
				# Clean if file is old or from another system
				if exports.files.length
					if (path.sep is '/' and data.indexOf('\\') isnt -1) or (path.sep is '\\' and data.indexOf('/') isnt -1) or RE_ABSOLUTE.test(exports.files[0])
						clean((err) -> fn())
			catch err
				return fn(err)
			fn()
	else
		fn()

# Add 'files' to the file log
# @param {Array} files
exports.add = (newFiles, fn) ->
	newFiles.forEach (file) =>
		file = path.relative(process.cwd(), file)
		if exports.files.indexOf(file) is -1
			exports.files.push(file)
			debug("adding to filelog: #{strong(file)}", 2)
	# Save
	fs.writeFile exports.filename, JSON.stringify(exports.files), 'utf8', (err) ->
		if fn
			return fn(err) if err
			fn(null, exports.files)

# Clean the file log of file references
# @param {Function} fn(err)
exports.clean = clean = (fn) ->
	exports.files = []
	# Save
	fs.writeFile exports.filename, JSON.stringify(exports.files), 'utf8', (err) ->
		debug('cleaned filelog', 2)
		if fn
			return fn(err) if err
			fn()
