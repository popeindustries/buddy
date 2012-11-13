ClassCamelCase = require './package/classcamelcase'

ccc = new ClassCamelCase

for item in [1,2,3,4,5]
	item++
	if item > 2
		console.log 'item is really big', item
