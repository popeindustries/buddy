exports.File = class File
	constructor: (@filepath, @filename, @name, @contents) ->
	
		updateContents: (contents) ->
			@contents = contents
		

exports.JSFile = class JSFile extends File
	constructor: (filepath, filename, name, contents, production) ->
	

exports.CSSFile = class CSSFile extends File
	constructor: (filepath, filename, name, contents) ->
		super(filepath, filename, name, contents)
	
