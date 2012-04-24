module.exports =
	RED: '0;31'
	YELLOW: '1;33'
	GREEN: '0;32'
	GREY: '0;90'

	silent: false

	nocolor: !process.stdout.isTTY

	out: (string, indentLevel = 1) ->
		console.log("#{(new Array(indentLevel)).join('  ')}" + string) unless @silent

	colour: (string, colourCode) ->
		return if @nocolor then string else `'\033[' + colourCode + 'm' + string + '\033[0m'`
