path = require('path')
fs = require('fs')
Configuration = require('../lib/configuration')

describe 'Configuration', ->
	beforeEach ->
		@config = new Configuration()

	describe 'locating config file', ->
		describe 'in a valid working directory', ->
			beforeEach ->
				process.chdir(path.resolve(__dirname, 'fixtures/configuration'))
			describe 'without a specified name', ->
				it 'should return a fully qualified path to the default file in the current working directory', ->
					@config.locate()
					@config.url.should.equal(path.resolve(process.cwd(), 'buddy.js'))
			describe 'with a specified name', ->
				it 'should return a fully qualified path to the specified file in the current working directory', ->
					@config.url = 'buddy_custom_name.js'
					@config.locate()
					@config.url.should.equal(path.resolve(process.cwd(), 'buddy_custom_name.js'))
			describe 'with a specified directory name', ->
				it 'should return a fully qualified path to the default file in the specified directory', ->
					@config.url = 'nested1'
					@config.locate()
					@config.url.should.equal(path.resolve(process.cwd(), 'buddy.js'))
			describe 'with a specified directory and name', ->
				it 'should return a fully qualified path to the default file in the specified directory', ->
					@config.url = 'nested1/buddy_custom_name.js'
					@config.locate()
					@config.url.should.equal(path.resolve(process.cwd(), 'buddy_custom_name.js'))
			describe 'with an invalid specified name', ->
				it 'should throw an error', ->
					@config.url = 'buddy_no_name.js'
					(=> @config.locate()).should.throw()
		describe 'from a valid child working directory', ->
			before ->
				process.chdir(path.resolve(__dirname, 'fixtures/configuration/nested2'))
			describe 'without a specified name', ->
				it 'should return a fully qualified path to the default file in a parent of the current working directory', ->
					@config.locate()
					@config.url.should.equal(path.resolve(process.cwd(), 'buddy.js'))
		describe 'in an invalid working directory', ->
			it 'should throw an error', ->
				process.chdir('/')
				(=> @config.locate()).should.throw()

	describe 'loading config file', ->
		before ->
			process.chdir(path.resolve(__dirname, 'fixtures/configuration'))
		describe 'with a valid file path', ->
			it 'should store data from the file', ->
				@config.url = path.resolve(process.cwd(), 'buddy.js')
				@config.locate().load()
				@config.build.should.be.ok
		describe 'with a malformed file', ->
			it 'should throw an error', ->
				@config.url = path.resolve(process.cwd(), 'buddy_bad.js')
				(=> @config.locate().load()).should.throw()
