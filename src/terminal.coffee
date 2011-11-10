exports.RED = 31
exports.GREEN = 32
exports.GREY = 90

exports.out = (string, indentLevel = 1) ->
	console.log "#{(new Array(indentLevel)).join('  ')}" + string

exports.colour = (string, colourCode) ->
	return "\033[#{colourCode}m#{string}\033[0m"
