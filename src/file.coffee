fs = require 'fs'
path = require 'path'
{log} = console

exports.File = class File
	constructor: (@filepath, @base) ->
		@filename = path.basename @filepath
		@name = @filename.replace(path.extname(@filename), '')
		@contents = null
		@contentsModule = null
	
	updateContents: (contents) ->
		@contents = contents
	

exports.JSFile = class JSFile extends File
	RE_COFFEE_EXT: /\.coffee$/
	RE_JS_EXT: /\.js$/
	RE_INDENT: /(^\t|^ +)\S/m
	RE_LINE_BEGIN: /^/gm
	RE_UPPERCASE: /[A-Z]/
	RE_REQUIRE: /^(?=.*?require\s*\(?\s*['|"]([^'"]*))(?:(?!#|(?:\/\/)).)*$/gm
	
	constructor: (filepath, base, contents) ->
		super filepath, base
		@module = @_getModuleName()
		@updateContents contents or fs.readFileSync(@filepath, 'utf8')
		@dependencies = @_getModuleDependencies()
	
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
	
	_getModuleDependencies: ->
		deps = []
		while match = @RE_REQUIRE.exec @contents
			dep = match[1]
			parts = dep.split '/'
			# Resolve relative path
			if dep.charAt(0) is '.'
				parts = @name.split '/'
				parts.pop()
				for part in dep.split '/'
					if part is '..' then parts.pop()
					else unless part is '.' then parts.push(part)
			deps.push parts.join '/'
		deps

exports.CSSFile = class CSSFile extends File
	RE_STYLUS_EXT: /\.styl$/
	RE_LESS_EXT: /\.less$/
	
	constructor: (filepath, base) ->
		super filepath, base
		@updateContents fs.readFileSync(@filepath, 'utf8')
	
