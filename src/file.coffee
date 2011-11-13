fs = require 'fs'
path = require 'path'

exports.File = class File
	RE_COFFEE_EXT: /\.coffee$/
	RE_JS_EXT: /\.js$/
	RE_STYLUS_EXT: /\.styl$/
	RE_LESS_EXT: /\.less$/

	constructor: (@filepath, contents) ->
		@filename = path.basename @filepath
		@name = @filename.replace(path.extname(@filename), '')
		@updateContents contents or fs.readFileSync(@filepath, 'utf8')
	
	updateContents: (contents) ->
		@contents = contents
	

exports.JSFile = class JSFile extends File
	constructor: (filepath, contents) ->
		super filepath, contents
	
	updateContents: (contents) ->
		# Wrap content in module definition
		if @filepath.match @RE_COFFEE_EXT
			@contents = 
				"""
					require.module #{@module}, (module, exports, require) ->
						#{contents.replace('\n', '\n\t')}
				"""
		else
			# Escape js contents for the coffeescript compiler
			@contents =
				"""
					`require.module(#{@module}, function(module, exports, require) {
					#{contents.replace('\n', '\n\t')}
					});`
				"""
	

exports.CSSFile = class CSSFile extends File
	constructor: (filepath, contents) ->
		super filepath, contents
	
