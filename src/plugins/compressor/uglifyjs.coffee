uglify = require('uglify-js')

module.exports =
	name: 'uglifyjs'
	category: 'js'
	type: 'compressor'

	# Compress 'data'
	# @param {String} data
	# @param {Function} fn(err, compressed)
	compress: (data, fn) ->
		try
			jsp = uglify.parser
			pro = uglify.uglify
			# Compress
			ast = jsp.parse(data)
			ast = pro.ast_mangle(ast)
			ast = pro.ast_squeeze(ast)
			compressed = pro.gen_code(ast)
			fn(null, compressed)
		catch err
			fn(err)
