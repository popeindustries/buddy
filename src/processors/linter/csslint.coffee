csslint = require('csslint').CSSLint

module.exports =
	name: 'csslint'
	category: 'css'
	type: 'linter'

	# Lint 'data'
	# @param {String} data
	# @param {Function} fn(err)
	lint: (data, fn) ->
		result = csslint.verify(data)
		if result.messages.length
			items = result.messages.map (error) ->
				return {line: error.line, col: error.col, reason: error.message}
			fn({items})
