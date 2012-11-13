path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Dependencies = require('../lib/dependencies')
plugins = require('../lib/plugins')

describe 'Dependencies', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/dependencies'))

	afterEach ->
		rimraf.sync(path.resolve('libs'))

	describe 'installing a source with a git:// endpoint', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_git.js')).dependencies)
			@deps.install ->
				fs.existsSync(path.resolve('libs/vendor/require.js')).should.be.true
				done()
	describe 'installing a source with a git:// endpoint and a specified source path', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_git_sourcepath.js')).dependencies)
			@deps.install ->
				fs.existsSync(path.resolve('libs/vendor/pi')).should.be.true
				done()
	describe 'installing a source with a named endpoint', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name.js')).dependencies)
			@deps.install ->
				fs.existsSync(path.resolve('libs/vendor/jquery.js')).should.be.true
				done()
	describe 'installing a source with a named endpoint and a dependency', ->
		it 'should install the sources to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name_dependant.js')).dependencies)
			@deps.install ->
				fs.existsSync(path.resolve('libs/vendor/backbone.js')).should.be.true
				fs.existsSync(path.resolve('libs/vendor/underscore.js')).should.be.true
				done()
	describe 'installing a source from a local endpoint', ->
		it 'should copy the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_local.js')).dependencies)
			@deps.install ->
				fs.existsSync(path.resolve('libs/vendor/lib/lib.js')).should.be.true
				done()
	describe 'installing a sources with a specified output', ->
		it 'should concatenate and minify the sources to the given output path', (done) ->
			p = plugins.load()
			@deps = new Dependencies(require(path.resolve('buddy_output.js')).dependencies, p.js.compressor)
			@deps.install ->
				fs.existsSync(path.resolve('libs/js/libs.js')).should.be.true
				done()

