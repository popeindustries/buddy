# Console output formatting
exports.RED = '0;31'
exports.YELLOW = '1;33'
exports.GREEN = '0;32'
exports.GREY = '0;90'

exports.silent = false

exports.nocolor = !process.stdout.isTTY

# Add TTY colours to given 'string'
# @param {String} string
# @param {String} colourCode
exports.colour = (string, colourCode) ->
	return if exports.nocolor then string else `'\033[' + colourCode + 'm' + string + '\033[0m'`

# Print 'msg' to console, with indentation level
# @param {String} msg
# @param {Int} ind
exports.print = (msg, ind = 1) ->
	console.log(exports.indent(msg, ind)) unless exports.silent

# Print 'err' to console, with error colour and indentation level
# @param {Object or String} err
# @param {Int} ind
exports.error = (err, ind = 1) ->
	err = new Error(err) if 'string' is typeof err
	exports.print("#{exports.colour('error', exports.RED)}: #{err.message}", ind)
	throw err

# Print 'msg' to console, with warning colour and indentation level
# @param {String} msg
# @param {Int} ind
exports.warn = (msg, indent = 1) ->
	msg = msg.message if 'string' instanceof Error
	exports.print("#{exports.colour('warning', exports.YELLOW)} #{msg}", indent)

# Colourize 'string' for emphasis
# @param {String} string
exports.strong = (string) ->
	exports.colour(string, exports.GREY)

# Indent the given 'string' a specific number of spaces
# @param {String} string
# @param {Int} level
exports.indent = (string, level) ->
	re = /^/gm
	string = string.replace(re, (new Array(level)).join('  '))
	string
