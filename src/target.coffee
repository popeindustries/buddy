fs = require 'fs'
path = require 'path'
term = require './terminal'
coffee = require 'coffee-script'
stylus = require 'stylus'
less = require 'less'
uglify = require 'uglify-js'
growl = require 'growl'
file = require './file'
{log} = console

exports.Target = class Target
	constructor: (@input, @output, @sourceCache) ->
		@sources = []
		@compress = false
		# Batch output if input is a folder
		@batch = fs.statSync(@input).isDirectory()
		@_parseInputs @input
		# Resolve output file name for file>folder target
		if not path.extname(@output).length and fs.statSync(@input).isFile()
			@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), @EXTENSION)
	
	run: (compress, clean) ->
		@compress = compress
		if @sources.length
			if clean
				@sources = []
				@_parseInputs @input
			term.out "building #{term.colour(path.basename(@input), term.GREY)} to #{term.colour(path.basename(@output), term.GREY)}", 2
			@_build()
		else
			term.out "#{term.colour('warning', term.YELLOW)} no sources to build in #{term.colour(@input, term.GREY)}", 2
	
	_parseInputs: (input) ->
		# Add files from source cache
		if fs.statSync(input).isFile()
			@_addInput(f) if f = @sourceCache.byPath[input]
		# Recurse child directories
		else
			@_parseInputs(path.join(input, item)) for item in fs.readdirSync input
	
	_addInput: (file) ->
		# Add source if not already added
		# TODO: add support for flagging across targets
		@sources.push(file) if file not in @sources
	
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
	EXTENSION: '.js'
		
	constructor: (input, output, sourceCache, @nodejs = false) ->
		super input, output, sourceCache
	
	_addInput: (file) ->
		# First add dependencies
		if file.dependencies.length
			for dependency in file.dependencies
				if dep = @sourceCache.byModule[dependency] or @sourceCache.byModule["#{dependency}/index"]
					@_addInput dep
				else
					term.out "#{term.colour('warning', term.YELLOW)} dependency #{term.colour(dependency, term.GREY)} for #{term.colour(file.module, term.GREY)} not found", 4
		# Store
		super file
	
	_build: () ->
		# Build individual files
		if @batch
			for f in @sources
				# Resolve output name
				filepath = path.join(@output, f.name) + @EXTENSION
				# Output to file, compressing if necessary
				# No header in this case since the normal use case is coffee>js compilation
				content = if @nodejs then f.contents else f.contentsModule
				if f.compile then @_compile(content, filepath, false) else @_writeFile(content, filepath, false)
			true
		# Concatenate source and compile
		else
			contents = []
			contents.push "`#{fs.readFileSync(path.join(__dirname, @REQUIRE), 'utf8')}`" unless @nodejs
			# Always use module contents since concatenation won't work in node.js anyway
			contents.push(f.contentsModule) for f in @sources
			# Concatenate and compile with header
			return @_compile contents.join('\n\n'), @output, true
	
	_compile: (content, filepath, header) ->
		try
			compiled = coffee.compile content, {bare: true}
			return if compiled then @_writeFile(compiled, filepath, header) else null
		catch error
			term.out "#{term.colour('error', term.RED)} building #{term.colour(path.basename(filepath), term.GREY)}: #{error}", 4
			@_displayNotification "error building #{filepath}: #{error}"
			return null
	
	_writeFile: (content, filepath, header) ->
		# Create directory if missing
		@_makeDirectory filepath
		term.out "#{term.colour('built', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4
		if @compress
			@_compress(filepath, content, header)
		else
			content = @_addHeader(content) if header
			fs.writeFileSync(filepath, content, 'utf8')
			# TODO: catch write error?
		return true
	
	_compress: (filepath, contents, header) ->
		jsp = uglify.parser
		pro = uglify.uglify
		# Compress
		ast = jsp.parse contents
		ast = pro.ast_mangle ast
		ast = pro.ast_squeeze ast
		compressed = pro.gen_code ast
		# Write file with header
		compressed = @_addHeader(compressed) if header
		fs.writeFileSync filepath, compressed
		term.out "#{term.colour('compressed', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4
	
	_addHeader: (content) ->	
		"#{@BUILT_HEADER}#{new Date().toString()}*/\n#{content}"
	

exports.CSSTarget = class CSSTarget extends Target
	EXTENSION: '.css'
	
	constructor: (input, output, sourceCache) ->
		super input, output, sourceCache
	
	_build: ->
		if @batch
			for f in @sources
				# Resolve output name
				filepath = path.join(@output, f.name) + @EXTENSION
				# Output to file, compressing if necessary
				if f.compile then @_compile(f.contents, filepath, path.extname(f.filepath)) else @_writeFile(f.contents, filepath)
			true
		else
			f = @sources[0]
			return @_compile(f.contents, @output, path.extname(f.filepath))
	
	_compile: (content, filepath, extension) ->
		if file.CSSFile::RE_STYLUS_EXT.test extension
			stylc = stylus(content).set('paths', @sourceCache.locations.concat())
			stylc.set('compress', true) if @compress
			stylc.render (error, css) =>
				if error
					term.out "#{term.colour('error', term.RED)} building #{term.colour(path.basename(filepath), term.GREY)}: #{error}", 4
					@_displayNotification "error building #{filepath}: #{error}"
					return null
				else
					return @_writeFile css, filepath
		else if file.CSSFile::RE_LESS_EXT.test extension
			less
		
	_writeFile: (content, filepath) ->
		# Create directory if missing
		@_makeDirectory filepath
		term.out "#{term.colour('built', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4
		fs.writeFileSync(filepath, content, 'utf8')
		# TODO: catch write error?
		return true
	
