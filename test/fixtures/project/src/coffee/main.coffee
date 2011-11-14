Nested = require './nested/nested'

nested = new Nested

for item in [1,2,3,4,5]
	item++
	if item > 2
		console.log 'item is really big', item
