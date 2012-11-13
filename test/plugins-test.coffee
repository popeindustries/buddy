path = require('path')
fs = require('fs')
plugins = require('../lib/plugins')

describe 'plugins', ->
	describe 'load', ->
		before ->
			process.chdir(path.resolve(__dirname, 'fixtures/plugins/load'))
		describe 'with no settings', ->
			it 'should load default plugins', ->
				p = plugins.load()
				p.should.have.property('js')
				p.js.should.have.property('compressor')
				p.js.compressor.should.have.property('name', 'uglifyjs')
		describe 'with a setting specifying a single additional custom plugin', ->
			it 'should load and add the custom plugin to the defaults', ->
				config = require(path.resolve(process.cwd(), 'buddy_custom_append.js'))
				p = plugins.load(config.settings.plugins)
				p.js.compilers.should.have.length(2)
		describe 'with a setting specifying an array of additional custom plugins', ->
			it 'should load and add the custom plugins to the defaults', ->
				config = require(path.resolve(process.cwd(), 'buddy_custom_append_array.js'))
				p = plugins.load(config.settings.plugins)
				p.js.compilers.should.have.length(2)
		describe 'with a setting specifying an overriden default', ->
			it 'should load and replace the default plugin with another default plugin', ->
				config = require(path.resolve(process.cwd(), 'buddy_default_override.js'))
				p = plugins.load(config.settings.plugins)
				p.js.module.should.have.property('name', 'amd')
		describe 'with a setting specifying a custom overriden default', ->
			it 'should load and replace the default plugin with a custom plugin', ->
				config = require(path.resolve(process.cwd(), 'buddy_custom_override.js'))
				p = plugins.load(config.settings.plugins)
				p.js.linter.should.have.property('name', 'mylinter')
		describe 'with a setting specifying a missing custom plugin', ->
			it 'should throw an error', ->
				config = require(path.resolve(process.cwd(), 'buddy_custom_none.js'))
				(=>plugins.load(config.settings.plugins)).should.throw()
