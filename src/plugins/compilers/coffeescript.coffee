coffee = require('coffee-script')

# RE_COMPILE_ERROR_LINE = /line\s(\d+)/gi
# ERROR_LINE_NUMBER = 4

module.exports =
	name: 'coffeescript'
	extension: 'coffee'
	category: 'js'
	type: 'compiler'

	compile: (data, sources, fn) ->
		try
			# Compile without function wrapper
			compiled = coffee.compile(data, {bare: true})
			fn(null, compiled)
		catch err
			fn(err, '')
			# Parse line number
			# TODO: is this still necessary?
			# if match = RE_COMPILE_ERROR_LINE.exec(err)
			# 	lineNo = +match[1] - 1
			# 	# Print lines before and after error line
			# 	lines = data.split('\n')
			# 	low = Math.max(lineNo-ERROR_LINE_NUMBER, 0)
			# 	high = Math.min(lineNo+ERROR_LINE_NUMBER, lines.length-1)
			# 	l = low
			# 	for line in lines[low..high]
			# 		if l++ is lineNo
			# 			notify.print("#{notify.colour('> ' + l + ' ' + line, notify.RED)}", 4)
			# 		else
			# 			notify.print("#{notify.colour(l + ' ' + line, notify.GREY)}", 5)
