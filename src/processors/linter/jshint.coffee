jshint = require('jshint').JSHINT

module.exports =
	name: 'jshint'
	category: 'js'
	type: 'linter'
	options:
		curly: true
		eqeqeq: true
		immed: true
		latedef: true
		newcap: true
		noarg: true
		undef: true
		eqnull: true
		es5: true
		esnext: true
		bitwise: true
		strict: false
		trailing: true
		smarttabs: true
		node: true

	# Lint 'data'
	# @param {String} data
	# @param {Function} fn(err)
	lint: (data, fn) ->
		result = jshint(data, @options, {})
		unless result
			items = jshint.errors.map (error) ->
				return {line: error.line, col: error.character, reason: error.reason}
			fn({items})