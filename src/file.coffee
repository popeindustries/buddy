fs = require('fs')
path = require('path')
{log} = console

exports.File = class File
	constructor: (@type, @filepath, @base) ->
		@filename = path.basename(@filepath)
		# qualified base name, with path from source root
		@name = path.relative(@base, @filepath).replace(path.extname(@filename), '')
		@contents = null
		@compile = false
		@lastChange = null

	updateContents: (contents) ->
		@contents = contents


exports.JSFile = class JSFile extends File
	RE_COFFEE_EXT: /\.coffee$/
	RE_JS_EXT: /\.js$/
	RE_COMMENT_LINES: /^\s*(?:\/\/|#).+$/gm
	RE_REQUIRE: /require[\s|\(]['|"](.*?)['|"]/g
	# "require.module('name', function(module, exports, require) {"
	RE_MODULE: /^require\.module\(.+function *\( *module *, *exports *, *require *\) *{/gm
	RE_WIN_SEPARATOR: /\\\\?/g

	constructor: (type, filepath, base, contents) ->
		super(type, filepath, base)
		@compile = @RE_COFFEE_EXT.test(@filepath)
		@module = @_getModuleName()
		@dependencies = []
		# Build target entry point flag
		@main = false
		@updateContents(contents or fs.readFileSync(@filepath, 'utf8'))

	# Store contents and parse dependencies
	updateContents: (contents) ->
		super(contents)
		@dependencies = @_getModuleDependencies()

	# Wrap compiled content in module definition if it doesn't already have a wrapper
	# Bootstrap if main entry point
	wrap: (contents) ->
		unless @RE_MODULE.test(contents)
			contents =
				"""
				require.module('#{@module}', function(module, exports, require) {
				#{contents}
				});
				"""
		contents += "\nrequire('" + @module + "');" if @main
		contents

	# Generate module name for this File
	_getModuleName: ->
		module = @name
		# Fix path separator for windows
		if process.platform is 'win32'
			module = module.replace(@RE_WIN_SEPARATOR, '/')
		# Convert uppercase letters to lowercase, adding _ where appropriate
		if (/[A-Z]/g).test(module)
			letters = Array::map.call module, (l, i, arr) =>
				if (/[A-Z]/g).test(l)
					return (if (i>0 and arr[i-1] isnt '/') then '_' else '') + l.toLowerCase()
				else
					return l
			module = letters.join().replace(/,/g, '')
		module

	# Parse dependencies
	_getModuleDependencies: ->
		deps = []
		# Remove commented lines
		contents = @contents.replace(@RE_COMMENT_LINES, '')
		# Match all uses of 'require' and parse path
		while match = @RE_REQUIRE.exec(contents)
			dep = match[1]
			parts = dep.split('/')
			# Resolve relative path
			if dep.charAt(0) is '.'
				parts = @module.split('/')
				parts.pop()
				for part in dep.split('/')
					if part is '..' then parts.pop()
					else unless part is '.' then parts.push(part)
			deps.push(parts.join('/'))
		deps


exports.CSSFile = class CSSFile extends File
	RE_STYLUS_EXT: /\.styl$/
	RE_LESS_EXT: /\.less$/

	constructor: (type, filepath, base) ->
		super(type, filepath, base)
		# Only compileable sources are valid
		@compile = true
		@updateContents(fs.readFileSync(@filepath, 'utf8'))
