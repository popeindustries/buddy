path = require('path')
fs = require('fs')
should = require('should')
processors = require('../lib/processors')

describe 'processors', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/processors/load'))

	describe 'load', ->
		it 'should load default processors', (done) ->
			processors.load null, (err, installed) ->
				installed.should.have.property('js')
				installed.js.should.have.property('compressor')
				installed.js.compressor.should.have.property('name', 'uglifyjs')
				done()
		it 'should load and add the a custom plugin to the defaults', (done) ->
			config = require(path.resolve('buddy_custom_append.js'))
			processors.load config.settings.plugins, (err, installed) ->
				installed.js.compilers.should.have.length(2)
				done()
		it 'should load and add an array of custom plugins to the defaults', (done) ->
			config = require(path.resolve('buddy_custom_append_array.js'))
			processors.load config.settings.plugins, (err, installed) ->
				installed.js.compilers.should.have.length(2)
				done()
		it 'should load and override the default plugin with another default plugin', (done) ->
			config = require(path.resolve('buddy_default_override.js'))
			processors.load config.settings.plugins, (err, installed) ->
				installed.js.module.should.have.property('name', 'amd')
				done()
		it 'should load and override the default plugin with a custom plugin', (done) ->
			config = require(path.resolve('buddy_custom_override.js'))
			processors.load config.settings.plugins, (err, installed) ->
				installed.js.linter.should.have.property('name', 'mylinter')
				done()
		it 'should return an error when passed a missing plugin', (done) ->
			config = require(path.resolve('buddy_custom_none.js'))
			processors.load config.settings.plugins, (err, installed) ->
				should.exist(err)
				done()
