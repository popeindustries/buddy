{log} = console

exports.Target = class Target
	constructor: (@input, @output) ->
	
	_parseInputs: (input) ->
		
		
		# # Source is file
		# if source.match @fileMatch
		# 	if file = @lookupSources.byPath[source]
		# 		# Add file if not ignored
		# 		@_addSource file unless file.filename.match(RE_IGNORE)
		# 	else
		# 		log "        #{stdoutColourize('warning', STDOUT_RED)} source #{stdoutColourize(source, STDOUT_GREY)} not found in sources"
		# # Source is directory
		# else
		# 	# Match the base path from defined source directories
		# 	base = (src for src in @configSources when src.indexOf(source) isnt -1)
		# 	if base.length
		# 		base = base[0]
		# 		base = if base.charAt(base.length - 1) isnt '/' then "#{base}/" else base
		# 		files = []
		# 		parseSourceContents source, base, files
		# 		# Add files when not ignored
		# 		@_addSource(file) for file in files when not file.filename.match(RE_IGNORE)
		# 	else
		# 		log "        #{stdoutColourize('warning', STDOUT_RED)} source #{stdoutColourize(source, STDOUT_GREY)} not found in sources"
		# return 

exports.JSTarget = class JSTarget extends Target
	sources: []
	
	constructor: (input, output) ->
		super input, output
	

exports.CSSTarget = class CSSTarget extends Target
	sources: []
	
	constructor: () ->
	