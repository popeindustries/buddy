path = require 'path'
assert = require 'assert'
vows = require 'vows'
builder = require '../lib/builder'
term = require '../lib/terminal'

term.silent = true

vows.describe('builder/configuration')
	.addBatch
		'loading config JSON file':
			'from valid working directory':
				topic: ->
					process.chdir(path.resolve(__dirname, 'fixtures/project'))
					builder._loadConfig()
				
				'returns true': (result) ->
					assert.isTrue result
				
			'from valid nested working directory':
				topic: ->
					process.chdir(path.resolve(__dirname, 'fixtures/project/src/coffee'))
					builder._loadConfig()
				
				'returns true': (result) ->
					assert.isTrue result
				
			'from invalid working directory':
				topic: ->
					process.chdir(path.resolve(__dirname, '../../'))
					builder._loadConfig()
				
				'returns false': (result) ->
					assert.isFalse result
				
			'with invalid format':
				topic: ->
					process.chdir(path.resolve(__dirname, 'fixtures/bad-json'))
					builder._loadConfig()
				
				'returns false': (result) ->
					assert.isFalse result
				
	.export(module)

vows.describe('builder/initialization')
	.addBatch
		'parsing JS sources':
			'with a single file':
				topic: ->
					# process.chdir(path.resolve(__dirname, 'fixtures/project'))
					# builder._loadConfig()
					builder._parseSourceContents(path.resolve(__dirname, 'fixtures/project/src/coffee'))
				
				'returns a source count of 1': (result) ->
					assert.equal builder.jsSources.count, 1
				
	.export(module)