# TODO: catch write errors?

fs = require('fs')
path = require('path')
term = require('./terminal')
coffee = require('coffee-script')
stylus = require('stylus')
less = require('less')
uglify = require('uglify-js')
growl = require('growl')
file = require('./file')
{log} = console

exports.Target = class Target

	constructor: (@input, @output, @cache) ->
		@compress = false
		@batch = null
		@sources = []

	initialize: ->
		if @_validInput(@input)
			@sources = []
			# Batch output if input is a folder and not already set
			if @batch is null
				@batch = fs.statSync(@input).isDirectory()
			# Resolve output file name for file>folder target
			if not path.extname(@output).length and fs.statSync(@input).isFile()
				@output = path.join(@output, path.basename(@input)).replace(path.extname(@input), @EXTENSION)
			@_parseInput(@input)
		else
			term.out("#{term.colour('warning', term.YELLOW)} input location does not exist #{term.colour(@input, term.GREY)}", 2)
		return @

	run: (@compress) ->
		if @sources.length
			term.out("building #{term.colour(path.basename(@input), term.GREY)} to #{term.colour(path.basename(@output), term.GREY)}", 2)
			@_build()
		else
			term.out("#{term.colour('warning', term.YELLOW)} no sources to build in #{term.colour(@input, term.GREY)}", 2)

	hasSource: (file) ->
		file in @sources

	# Validate input source
	_validInput: (input) ->
		path.existsSync(input)

	# Recursively add File objects from source cache based on filepath
	_parseInput: (input) ->
		# Add files from source cache
		if fs.statSync(input).isFile()
			@_addSource(f) if f = @cache.byPath[input]
		else
			# Recurse child directories
			@_parseInput(path.join(input, item)) for item in fs.readdirSync(input)

	_addSource: (file) ->
		# Add source if not already added
		@sources.push(file) if file not in @sources

	# mkdirp
	_makeDirectory: (filepath) ->
		dir = path.dirname(filepath)
		unless path.existsSync(dir)
			try
				fs.statSync(dir).isDirectory()
			catch error
				if error.code is 'ENOENT'
					@_makeDirectory(dir)
					fs.mkdirSync(dir)

	# Output error to terminal and notify with growl
	_notifyError: (filepath, error) ->
		term.out("#{term.colour('error', term.RED)} building #{term.colour(path.basename(filepath), term.GREY)}: #{error}", 4)
		try growl.notify("error building #{filepath}: #{error}", {title: 'BUDDY'})


exports.JSTarget = class JSTarget extends Target
	BUILT_HEADER: '/*BUILT '
	REQUIRE: 'require.js'
	EXTENSION: '.js'
	ERROR_LINE_NUMBER: 4
	RE_COFFEE_HELPERS: /^(\s+)(__\w*)\s=\s(.+)(,|;)$/gm
	RE_COMPILE_ERROR_LINE: /line\s(\d+)/gi

	constructor: (input, output, cache, @nodejs = false, @parentTarget = null) ->
		super(input, output, cache)

	initialize: ->
		# Treat nodejs targets as batch targets since concatenation does not apply
		@batch = true if @nodejs
		super()

	_addSource: (file, dependantFile) ->
		# If this target has a parent, make sure we don't duplicate sources
		return if @parentTarget?.hasSource(file)
		# First add dependencies
		if file.dependencies.length
			for dependency in file.dependencies
				# Guard against circular dependency
				if dependantFile?.module isnt dependency
					if dep = @cache.byModule[dependency] or @cache.byModule["#{dependency}/index"]
						# Recursively add dependency
						@_addSource(dep, file)
					else
						term.out("#{term.colour('warning', term.YELLOW)} dependency #{term.colour(dependency, term.GREY)} for #{term.colour(file.module, term.GREY)} not found", 4)
		# Flag file as entry point
		file.main = true if file.filepath is @input and not @batch
		# Store
		super(file)

	_build: () ->
		# Build individual files
		if @batch
			for f in @sources
				# Resolve output name
				filepath = if path.extname(@output).length then @output else path.join(@output, f.name) + @EXTENSION
				# Compile
				content = if f.compile then @_compile(f.contents, filepath) else f.contents
				if content?
					# Wrap unless for node.js
					content = f.wrap(content) unless @nodejs
					# Output to file, compressing if necessary
					# No header in this case since no concatenation
					@_writeFile(content, filepath, false)
			return true
		# Compile and concatenate sources
		else
			contents = []
			for f in @sources
				# Compile if necessary
				c = if f.compile then @_compile(f.contents, f.filepath) else f.contents
				# Always wrap contents since concatenation won't work in node.js anyway
				contents.push(f.wrap(c))
			content = contents.join('\n')
			if content?
				# Add require source unless this target is a child target or we are compiling for node
				content = "#{fs.readFileSync(path.join(__dirname, @REQUIRE), 'utf8')}\n#{content}" unless @nodejs or @parentTarget
				# Wrap, and write file with header
				@_writeFile(@_optimizeAndWrap(content), @output, true)
				return true
			else
				return null

	_compile: (content, filepath) ->
		try
			# Compile without function wrapper
			coffee.compile(content, {bare: true})
		catch error
			@_notifyError(filepath, error)
			# Parse line number
			if match = @RE_COMPILE_ERROR_LINE.exec(error)
				lineNo = +match[1] - 1
				# Print lines before and after error line
				lines = content.split('\n')
				low = Math.max(lineNo-@ERROR_LINE_NUMBER, 0)
				high = Math.min(lineNo+@ERROR_LINE_NUMBER, lines.length-1)
				l = low
				for line in lines[low..high]
					if l++ is lineNo
						term.out("#{term.colour('> ' + l + ' ' + line, term.RED)}", 4)
					else
						term.out("#{term.colour(l + ' ' + line, term.GREY)}", 5)
			null

	_writeFile: (content, filepath, header) ->
		# Create directory if missing
		@_makeDirectory(filepath)
		term.out("#{term.colour('built', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4)
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
		ast = jsp.parse(contents)
		ast = pro.ast_mangle(ast)
		ast = pro.ast_squeeze(ast)
		compressed = pro.gen_code(ast)
		# Write file with header
		compressed = @_addHeader(compressed) if header
		fs.writeFileSync(filepath, compressed)
		term.out("#{term.colour('compressed', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4)

	_optimizeAndWrap: (contents) ->
		# Replace and store all cs global expressions ('__bind', etc)
		snippets = {}
		replaceSnippet = (str, p1, p2, p3, p4) ->
			snippets[p2] = p3.replace('__', '___')
			"#{p1}#{p2} = _#{p2}#{p4}"
		contents = contents.replace(@RE_COFFEE_HELPERS, replaceSnippet)
		# Hoist expressions to top and wrap
		"""
		(function () {
		#{(('  var _' + snippet + ' = ' + expr) for snippet, expr of snippets).join(';\n')};
		#{contents}
		}).call(this);
		"""

	_addHeader: (content) ->
		"#{@BUILT_HEADER}#{new Date().toString()}*/\n#{content}"


exports.CSSTarget = class CSSTarget extends Target
	EXTENSION: '.css'

	constructor: (input, output, cache) ->
		super(input, output, cache)

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
		# Compile Stylus file
		if file.CSSFile::RE_STYLUS_EXT.test(extension)
			stylc = stylus(content).set('paths', @cache.locations.concat())
			stylc.set('compress', true) if @compress
			stylc.render (error, css) =>
				if error
					@_notifyError(filepath, error)
					return null
				else
					return @_writeFile(css, filepath)
		# Compile Less file
		else if file.CSSFile::RE_LESS_EXT.test(extension)
			parser = new less.Parser {paths: @cache.locations.concat()}
			parser.parse content, (error, tree) =>
				if error
					@_notifyError(filepath, error)
					return null
				else
					return @_writeFile(tree.toCSS({compress: @compress}), filepath)

	_writeFile: (content, filepath) ->
		# Create directory if missing
		@_makeDirectory(filepath)
		term.out("#{term.colour('built', term.GREEN)} #{term.colour(path.basename(filepath), term.GREY)}", 4)
		fs.writeFileSync(filepath, content, 'utf8')
		return true

