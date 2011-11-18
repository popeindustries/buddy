fs = require 'fs'
path = require 'path'
term = require './terminal'
coffee = require 'coffee-script'
less = require 'less'
uglify = require 'uglify-js'
growl = require 'growl'
{log} = console

exports.Target = class Target
	constructor: (@input, @output, @sourceCache) ->
		@sources = []
		@_parseInputs @input
	
	run: (mini, bare, clean) ->
		if @sources.length
			if clean
				@sources = []
				@_parseInputs @input
			term.out "building #{term.colour(path.basename(@input), term.GREY)} to #{term.colour(path.basename(@output), term.GREY)}", 2
			@_build(mini, bare)
		else
			term.out "#{term.colour('warning', term.YELLOW)} no sources to build in #{term.colour(@input, term.GREY)}", 2
	
	_parseInputs: (input) ->
		# Add files from source cache
		if fs.statSync(input).isFile()
			if file = @sourceCache.byPath[input]
				@_addInput file
			else
				term.out "#{term.colour('warning', term.YELLOW)} #{term.colour(@input, term.GREY)} not found in sources", 2
		# Recurse child directories
		else
			@_parseInputs(path.join(input, item)) for item in fs.readdirSync input
	
	_makeDirectory: (filepath) ->
		dir = path.dirname filepath
		unless path.existsSync dir
			fs.mkdirSync dir, 0777
	
	_displayNotification: (message = '') ->
		options =
			title: 'BUILDER'
		try growl.notify message, options
	

exports.JSTarget = class JSTarget extends Target
	BUILT_HEADER: '/*BUILT '
	REQUIRE: 'require.js'
	
	constructor: (input, output, sourceCache) ->
		super input, output, sourceCache
		# Concatenate output if input is a single file
		@concatenate = fs.statSync(@input).isFile()
		# Resolve output file name for file>folder target
		if @concatenate and not path.extname(@output).length
			@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), '.js')
	
	_addInput: (file) ->
		# First add dependencies
		if file.dependencies.length
			for dependency in file.dependencies
				if dep = @sourceCache.byModule[dependency] or @sourceCache.byModule["#{dependency}/index"]
					@_addInput dep
				else
					term.out "#{term.colour('warning', term.YELLOW)} dependency #{term.colour(dependency, term.GREY)} for #{term.colour(file.module, term.GREY)} not found", 4
		# Add source if not already added
		# TODO: add support for flagging across targets
		@sources.push(file) if file not in @sources
	
	_build: (mini, bare) ->
		# Concatenate source and compile
		if @concatenate
			contents = []
			contents.push "`#{fs.readFileSync(path.join(__dirname, @REQUIRE), 'utf8')}`" unless bare
			# Always use module contents since concatenation won't work in node.js
			contents.push(file.contentsModule) for file in @sources
			compiled = @_compile contents.join('\n\n'), @input
			return null unless compiled
			# Add header
			compiled = @_addHeader(compiled)
			term.out "#{term.colour('compiled', term.GREEN)} #{term.colour(path.basename(@output), term.GREY)}", 4
			if mini then @_minify(@output, compiled) else fs.writeFileSync(@output, compiled, 'utf8')
		else
			for file in @sources
				filepath = path.join(@output, file.name) + '.js'
				# Create directory if missing
				@_makeDirectory filepath
				# Compile file contents
				if file.compile
					compiled = @_compile (if bare then file.contents else file.contentsModule), filepath
					return null unless compiled
					fs.writeFileSync filepath, compiled, 'utf8'
					term.out "#{term.colour('compiled', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4
	
	_compile: (contents, name) ->
		try
			compiled = coffee.compile contents, {bare: true}
			return compiled
		catch error
			term.out "#{term.colour('error', term.RED)} compiling #{term.colour(name, term.GREY)}: #{error}", 4
			@_displayNotification "error compiling #{name}: #{error}"
			return null
	
	_minify: (file, contents) ->
		jsp = uglify.parser
		pro = uglify.uglify
		# Compress
		ast = jsp.parse contents
		ast = pro.ast_mangle ast
		ast = pro.ast_squeeze ast
		compressed = pro.gen_code ast
		# Write file with header
		fs.writeFileSync file, @_addHeader(compressed)
		term.out "#{term.colour('minified', term.GREEN)} #{term.colour(path.basename(file), term.GREY)}", 4
	
	_addHeader: (content) ->
		"#{@BUILT_HEADER}#{new Date().toString()}*/\n#{content}"
	

exports.CSSTarget = class CSSTarget extends Target
	constructor: (input, output, sourceCache) ->
	
	_addInput: (file) ->
		# Add source if not already added
		@sources.push(file) if file not in @sources
	
	_build: (mini, bare) ->
		
	
