require.module 'wrapped', (module, exports, require) ->
	exports.func = ->
		myVar = 'hey'
		console.log myVar