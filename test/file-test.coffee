path = require 'path'
assert = require 'assert'
vows = require 'vows'
term = require '../lib/terminal'
file = require '../lib/file'

term.silent = true

vows.describe('file/instantiation')
	.addBatch
		'a JSFile instance':
			topic: new file.JSFile path.resolve(__dirname, 'fixtures/project/src/coffee/main.coffee')
			'adds module wrapper': (jsFile) ->
				console.log jsFile
	.export(module)
