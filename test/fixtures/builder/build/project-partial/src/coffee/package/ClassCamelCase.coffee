Class = require './class'

module.exports = class ClassCamelCase extends Class

	constructor: ->
		@someVar = 'hey'

	someFunc: ->
		console.log @someVar