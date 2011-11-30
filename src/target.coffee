# TODO: catch write errors?

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
	constructor: (@input, @output, @cache) ->
		@sources = []
		@compress = false
		# Batch output if input is a folder
		@batch = fs.statSync(@input).isDirectory()
		# Resolve output file name for file>folder target
		if not path.extname(@output).length and fs.statSync(@input).isFile()
			@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), @EXTENSION)
			
		@_parseSources @input
	
	run: (compress, clean) ->
		@compress = compress
		if @sources.length
			if clean
				@sources = []
				@_parseSources @input
			term.out "building #{term.colour(path.basename(@input), term.GREY)} to #{term.colour(path.basename(@output), term.GREY)}", 2
			@_build()
		else
			term.out "#{term.colour('warning', term.YELLOW)} no sources to build in #{term.colour(@input, term.GREY)}", 2
	
	hasSource: (file) ->
		file in @sources
	
	_parseSources: (input) ->
		# Add files from source cache
		if fs.statSync(input).isFile()
			@_addSource(f) if f = @cache.byPath[input]
		# Recurse child directories
		else
			@_parseSources(path.join(input, item)) for item in fs.readdirSync input
	
	_addSource: (file) ->
		# Add source if not already added
		@sources.push(file) if file not in @sources
	
	_makeDirectory: (filepath) ->
		dir = path.dirname filepath
		unless path.existsSync dir
			try
				fs.statSync(dir).isDirectory()
			catch error
				if error.code is 'ENOENT'
					@_makeDirectory(dir)
					fs.mkdirSync dir, 0777
	
	_notifyError: (filepath, error) ->
		term.out "#{term.colour('error', term.RED)} building #{term.colour(path.basename(filepath), term.GREY)}: #{error}", 4
		try growl.notify "error building #{filepath}: #{error}", {title: 'BUDDY'}
	

exports.JSTarget = class JSTarget extends Target
	BUILT_HEADER: '/*BUILT '
	REQUIRE: 'require.js'
	EXTENSION: '.js'
		
	constructor: (input, output, cache, @nodejs = false, @parentTarget = null) ->
		super input, output, cache
		# Treat nodejs targets as batch targets since concatenation does not apply
		@batch = true if @nodejs
	
	_addSource: (file) ->
		# If this target has a parent, make sure we don't duplicate sources
		return if @parentTarget?.hasSource(file)
		# First add dependencies
		if file.dependencies.length
			for dependency in file.dependencies
				if dep = @cache.byModule[dependency] or @cache.byModule["#{dependency}/index"]
					@_addSource dep
				else
					term.out "#{term.colour('warning', term.YELLOW)} dependency #{term.colour(dependency, term.GREY)} for #{term.colour(file.module, term.GREY)} not found", 4
		# Flag file as entry point
		file.main = true if file.filepath is @input and not @batch
		# Store
		super file
	
	_build: () ->
		# Build individual files
		if @batch
			for f in @sources
				# Resolve output name
				filepath = if path.extname(@output).length then @output else path.join(@output, f.name) + @EXTENSION 
				# No header in this case since no concatenation
				# Output to file, compressing if necessary
				content = if @nodejs then f.contents else f.wrap()
				if f.compile then @_compile(content, filepath, false) else @_writeFile(content, filepath, false)
			true
		# Concatenate source and compile
		else
			contents = []
			# Add require source unless this target is a child target or we are compiling for node
			contents.push "`#{fs.readFileSync(path.join(__dirname, @REQUIRE), 'utf8')}`" unless @nodejs or @parentTarget
			# Always use module contents since concatenation won't work in node.js anyway
			contents.push(f.wrap()) for f in @sources
			# Concatenate and compile with header
			return @_compile contents.join('\n\n'), @output, true
	
	_compile: (content, filepath, header) ->
		try
			compiled = coffee.compile content, {bare: true}
			return if compiled then @_writeFile(compiled, filepath, header) else null
		catch error
			@_notifyError(filepath, error)
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
	
	constructor: (input, output, cache) ->
		super input, output, cache
	
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
			stylc = stylus(content).set('paths', @cache.locations.concat())
			stylc.set('compress', true) if @compress
			stylc.render (error, css) =>
				if error
					@_notifyError(filepath, error)
					return null
				else
					return @_writeFile css, filepath
			
		else if file.CSSFile::RE_LESS_EXT.test extension
			parser = new less.Parser {paths: @cache.locations.concat()}
			parser.parse content, (error, tree) =>
				if error
					@_notifyError(filepath, error)
					return null
				else
					return @_writeFile tree.toCSS({compress: @compress}), filepath
	
	_writeFile: (content, filepath) ->
		# Create directory if missing
		@_makeDirectory filepath
		term.out "#{term.colour('built', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4
		fs.writeFileSync(filepath, content, 'utf8')
		return true
	
