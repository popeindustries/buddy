path = require('path')
fs = require('fs')
should = require('should')
plugins = require('../lib/plugins')

describe 'plugins', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/plugins/load'))

	describe 'load', ->
		it 'should load default plugins', (done) ->
			plugins.load null, (err, plugs) ->
				plugs.should.have.property('js')
				plugs.js.should.have.property('compressor')
				plugs.js.compressor.should.have.property('name', 'uglifyjs')
				done()
		it 'should load and add the a custom plugin to the defaults', (done) ->
			config = require(path.resolve('buddy_custom_append.js'))
			plugins.load config.settings.plugins, (err, plugs) ->
				plugs.js.compilers.should.have.length(2)
				done()
		it 'should load and add an array of custom plugins to the defaults', (done) ->
			config = require(path.resolve('buddy_custom_append_array.js'))
			plugins.load config.settings.plugins, (err, plugs) ->
				plugs.js.compilers.should.have.length(2)
				done()
		it 'should load and override the default plugin with another default plugin', (done) ->
			config = require(path.resolve('buddy_default_override.js'))
			plugins.load config.settings.plugins, (err, plugs) ->
				plugs.js.module.should.have.property('name', 'amd')
				done()
		it 'should load and override the default plugin with a custom plugin', (done) ->
			config = require(path.resolve('buddy_custom_override.js'))
			plugins.load config.settings.plugins, (err, plugs) ->
				plugs.js.linter.should.have.property('name', 'mylinter')
				done()
		it 'should return an error when passed a missing plugin', (done) ->
			config = require(path.resolve('buddy_custom_none.js'))
			plugins.load config.settings.plugins, (err, plugs) ->
				should.exist(err)
				done()
