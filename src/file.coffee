fs = require 'fs'
path = require 'path'
{log} = console

exports.File = class File
	RE_COFFEE_EXT: /\.coffee$/
	RE_JS_EXT: /\.js$/
	RE_STYLUS_EXT: /\.styl$/
	RE_LESS_EXT: /\.less$/
	RE_INDENT: /(^\t|^ +)\w/m
	RE_LINE_BEGIN: /^/gm
	RE_UPPERCASE: /[A-Z]/
	
	base: null

	constructor: (@filepath, @base) ->
		@filename = path.basename @filepath
		@name = @filename.replace(path.extname(@filename), '')
		@contents = null
		@contentsModule = null
	
	updateContents: (contents) ->
		@contents = contents
	

exports.JSFile = class JSFile extends File
	constructor: (filepath, base, contents) ->
		super filepath, base
		@module = @_getModuleName()
		@updateContents contents or fs.readFileSync(@filepath, 'utf8')
	
	updateContents: (contents) ->
		@contents = contents
		# Wrap content in module definition
		if @RE_COFFEE_EXT.test @filepath
			# Find the currently used indent style
			indent = contents.match(@RE_INDENT)[1] or '\t'
			@contentsModule = 
				"""
					require.module '#{@module}', (module, exports, require) ->
					#{contents.replace(@RE_LINE_BEGIN, indent)}
				"""
		else
			# Escape js contents for the coffeescript compiler
			@contentsModule =
				"""
					`require.module('#{@module}', function(module, exports, require) {
					#{contents}
					});`
				"""
	_getModuleName: ->
		module = path.relative(@base, @filepath).replace(path.extname(@filename), '')
		if @RE_UPPERCASE.test @name
			letters = @name.split ''
			for letter, i in letters
				if @RE_UPPERCASE.test letter
					letters[i] = (if (i>0) then '_' else '') + letter.toLowerCase()
			module = module.replace(@name, letters.join().replace(/,/g, ''))
		module
	

exports.CSSFile = class CSSFile extends File
	constructor: (filepath, base) ->
		super filepath, base
		@updateContents fs.readFileSync(@filepath, 'utf8')
	
