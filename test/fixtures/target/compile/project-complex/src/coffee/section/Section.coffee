util = require 'utils/util'
	
module.exports = class Section
	
	constructor: ->
		@someVar = 'hey'
	
	someFunc: ->
		console.log @someVar