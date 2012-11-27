less = require('less')

module.exports =
	name: 'less'
	extension: 'less'
	category: 'css'
	type: 'compiler'

	# Compile 'data' and pass 'sources' for dependency reference
	# @param {String} data
	# @param {Function} fn(err, compiled)
	compile: (data, fn) ->
		parser = new less.Parser({paths: sources})
		parser.parse data, (err, tree) =>
			if err
				fn(err, '')
			else
				fn(null, tree.toCSS())
