module.exports =
	RED: 31
	GREEN: 32
	GREY: 90
	
	silent: false

	out: (string, indentLevel = 1) ->
		console.log("#{(new Array(indentLevel)).join('  ')}" + string) unless @silent

	colour: (string, colourCode) ->
		return "\033[#{colourCode}m#{string}\033[0m"
