# Nothing = require('./nonexistant')
module.exports = class Class
	constructor: ->
		@someVar = 'hey'
	someFunc: ->
		console.log @someVar