jshint = require('jshint').JSHINT

RE_TRIM = /^\s+|\s+$/

module.exports =
	name: 'jshint'
	category: 'js'
	type: 'linter'
	options:
		curly: true
		eqeqeq: false
		immed: true
		latedef: true
		newcap: true
		noarg: true
		undef: true
		unused: true
		eqnull: true
		es5: false
		esnext: false
		bitwise: true
		strict: false
		trailing: false
		smarttabs: true
		node: true
		boss: true

	# Lint 'data'
	# @param {String} data
	# @param {Function} fn(err)
	lint: (data, fn) ->
		result = jshint(data, exports.options, {})
		unless result
			items = jshint.errors.map (error) ->
				return if error then {line: error.line, col: error.character, reason: error.reason, evidence: error.evidence?.replace(RE_TRIM, '')} else null
			fn({items})