# TODO: parse dependencies
File = require('./file')

module.exports = class CSSFile extends File

	# Constructor
	# @param {String} filepath
	# @param {String} basepath [root source location]
	# @param {Object} compilers
	constructor: (filepath, basepath, compilers) ->
		super('css', filepath, basepath, compilers)

	# Read file contents
	# @param {Boolean} modular
	# @param {Function} fn(err, data)
	parseContents: (modular, fn) ->
		super (err, data) =>
			return fn(err) if err
			fn(null, data)
