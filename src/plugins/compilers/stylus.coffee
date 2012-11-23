stylus = require('stylus')

module.exports =
	name: 'stylus'
	extension: 'styl'
	category: 'css'
	type: 'compiler'

	# Compile 'data' and pass 'sources' for dependency reference
	# @param {String} data
	# @param {String} sources
	# @param {Function} fn(err, compiled)
	compile: (content, sources, fn) ->
		stylc = stylus(content).set('paths', sources)
		stylc.render (err, css) =>
			if err
				fn(err, '')
			else
				fn(null, css)

