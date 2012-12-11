# Extend 'obj' with properties from 'options'
# @param {Object} obj
# @param {Object} options
exports.extend = (obj, options) ->
	for option, value of options
		obj[option] = value
	return obj

# Shallow copy of 'obj'
# @param {Object} obj
# @return {Object}
exports.clone = (obj) ->
	o = {}
	for prop, value of obj
		o[prop] = value
	return o
