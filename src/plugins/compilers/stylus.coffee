stylus = require('stylus')

module.exports =
	name: 'stylus'
	extension: 'styl'
	category: 'css'
	type: 'compiler'

	compile: (content, sources, fn) ->
		stylc = stylus(content).set('paths', sources)
		stylc.render (err, css) =>
			if err
				fn(err, '')
			else
				fn(null, css)

