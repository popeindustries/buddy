# Console output formatting
exports.RED = '0;31'
exports.YELLOW = '0;33'
exports.CYAN = '0;36'
exports.GREEN = '0;32'
exports.GREY = '0;90'

exports.silent = false
exports.verbose = false

exports.nocolor = !process.stdout.isTTY

exports.start = exports.last = 0

# Add TTY colours to given 'string'
# @param {String} string
# @param {String} colourCode
exports.colour = (string, colourCode) ->
	return if exports.nocolor then string else `'\033[' + colourCode + 'm' + string + '\033[0m'`

# Print 'msg' to console, with indentation level
# @param {String} msg
# @param {Int} column
exports.print = (msg, column = 0) ->
	console.log(exports.indent(msg, column)) unless exports.silent

# Print 'err' to console, with error colour and indentation level
# @param {Object or String} err
# @param {Int} column
exports.error = (err, column = 0, throws = true) ->
	err = new Error(err) if 'string' is typeof err
	# Add beep when not throwing
	err.message += '\x07' unless throws
	exports.print("#{exports.colour('error', exports.RED)}: #{err.message}", column)
	throw err if throws

# Print 'msg' to console, with warning colour and indentation level
# @param {String} msg
# @param {Int} column
exports.warn = (msg, column = 0) ->
	msg = msg.message if 'string' instanceof Error
	exports.print("#{exports.colour('warning', exports.YELLOW)} #{msg}", column)

exports.debug = (msg, column = 0) ->
	now = +new Date
	exports.last = exports.start unless exports.last
	exports.print("#{exports.colour('+', exports.CYAN)}#{exports.strong(now - exports.last + 'ms')}#{exports.colour('::', exports.CYAN)}#{exports.strong(now - exports.start + 'ms')}#{exports.colour('=', exports.CYAN)}#{msg}", column) if exports.verbose
	exports.last = now

# Colourize 'string' for emphasis
# @param {String} string
exports.strong = (string) ->
	exports.colour(string, exports.GREY)

# Indent the given 'string' a specific number of spaces
# @param {String} string
# @param {Int} column
exports.indent = (string, column) ->
	spaces = (new Array(column)).join('  ')
	string.replace(/^/gm, spaces)
