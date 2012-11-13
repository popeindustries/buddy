less = require('less')

module.exports =
	name: 'less'
	extension: 'less'
	category: 'css'
	type: 'compiler'

	compile: (data, sources, fn) ->
		parser = new less.Parser({paths: sources})
		parser.parse data, (err, tree) =>
			if err
				fn(err, '')
			else
				fn(null, tree.toCSS())
