cleanCSS = require('clean-css')

module.exports =
	name: 'cleancss'
	category: 'css'
	type: 'compressor'

	compress: (data, fn) ->
		try
			compressed = cleanCSS.process(data)
			fn(null, compressed)
		catch err
			fn(err)

