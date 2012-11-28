fs = require('fs')
path = require('path')
{existsSync} = require('./fs')

NAME = '.buddy-filelog'
RE_ABSOLUTE = /^([a-z]:\\)|^\//i

exports.filename = filename = path.resolve(NAME)

exports.files = files = []

# Load existing
if existsSync(filename)
	fs.readFile filename, 'utf8', (err, data) ->
		return if err
		try
			files = JSON.parse(data)
			# Clean if file is old or from another system
			if files.length
				if (path.sep is '/' and data.indexOf('\\') isnt -1) or (path.sep is '\\' and data.indexOf('/') isnt -1) or RE_ABSOLUTE.test(files[0])
					clean()
		catch err
			return

# Add 'files' to the file log
# @param {Array} files
# @param {Function} fn(err)
exports.add = (newFiles, fn) ->
	newFiles.forEach (file) =>
		file = path.relative(process.cwd(), file)
		files.push(file) if files.indexOf(file) is -1
	# Save
	fs.writeFile filename, JSON.stringify(files), 'utf8', (err) ->
		if err then fn(err) else fn(null, files)

# Clean the file log of file references
# @param {Function} fn(err)
exports.clean = clean = (fn) ->
	files = []
	# Save
	fs.writeFile filename, JSON.stringify(files), 'utf8', (err) ->
		if err then fn(err) else fn()
