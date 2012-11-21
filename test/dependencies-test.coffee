path = require('path')
fs = require('fs')
rimraf = require('rimraf')
should = require('should')
Dependencies = require('../lib/dependencies')
Dependency = require('../lib/dependency')
plugins = require('../lib/plugins')

describe.only 'Dependencies', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/dependencies'))
	# afterEach ->
	# 	rimraf.sync(path.resolve('libs'))

	describe 'Dependency', ->

		describe 'an instance', ->
			it 'should set `local` property if `source` exists locally', ->
				new Dependency('local/lib', '').local.should.be.true
			it 'should parse specified `version` number', ->
				new Dependency('popeindustries/buddy@0.4.0', '').version.should.eql('0.4.0')
			it 'should default unspecified `version` number to `master`', ->
				new Dependency('popeindustries/buddy', '').version.should.eql('master')
			it 'should generate a valid github `url`', ->
				new Dependency('popeindustries/buddy', '').url.should.eql('https://github.com/popeindustries/buddy/archive/master.zip')
			it 'should not generate a `url` for a named source', ->
				should.not.exist(new Dependency('jquery', '').url)
			it 'should store specified `paths` in an array', ->
				dep = new Dependency('popeindustries/lib#lib/pi/dom|lib/pi/event.js|lib/pi/utils')
				dep.paths.should.include('lib/pi/dom')
				dep.paths.should.include('lib/pi/event.js')
				dep.paths.should.include('lib/pi/utils')

		describe 'package lookup', ->
			it 'should resolve a valid `url`', (done) ->
				dependency = new Dependency('backbone', '')
				dependency.lookupPackage()
				.once 'end', ->
					dependency.url.should.eql('https://github.com/documentcloud/backbone/archive/master.zip')
					done()
			it 'should return an error for an invalid package', (done) ->
				dependency = new Dependency('bunk', '')
				dependency.lookupPackage()
				.once 'error', (err) ->
					should.exist(err)
					done()

		describe 'remote archive fetching', ->
			before ->
				@temp = path.resolve('libs')
				fs.mkdirSync(@temp) unless fs.existsSync(@temp)
			it 'should download an archive file to the temp directory', (done) ->
				dependency = new Dependency('popeindustries/buddy', '')
				dependency.fetch(@temp)
				.once 'end', ->
					dependency.paths.should.eql(path.resolve('libs/buddy-master'))
					fs.existsSync(dependency.paths).should.be.true
					done()
			it 'should return an error for an invalid url', (done) ->
				dependency = new Dependency('popeindustries/bunk', '')
				dependency.fetch(@temp)
				.once 'error', (err) ->
					should.exist(err)
					done()

	describe.skip 'installing a source with a git:// endpoint', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_git.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/require.js')).should.be.true
				done()
	describe.skip 'installing a source with a git:// endpoint and a specified source path', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_git_sourcepath.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/pi')).should.be.true
				done()
	describe.skip 'installing a source with a named endpoint', ->
		it 'should install the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/jquery.js')).should.be.true
				done()
	describe.skip 'installing a source with a named endpoint and a dependency', ->
		it 'should install the sources to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name_dependant.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/backbone.js')).should.be.true
				fs.existsSync(path.resolve('libs/vendor/underscore.js')).should.be.true
				done()
	describe.skip 'installing a source from a local endpoint', ->
		it 'should copy the source to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_local.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/lib/lib.js')).should.be.true
				done()
	describe.skip 'installing a source from a local endpoint that resides in destination path', ->
		it 'should not be marked for cleanup', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_local_dest.js')).dependencies)
			@deps.install (err, files) ->
				files.should.have.length(0)
				done()
	describe.skip 'installing sources with a specified output', ->
		it 'should concatenate and minify the sources to the given output path', (done) ->
			p = plugins.load()
			@deps = new Dependencies(require(path.resolve('buddy_output.js')).dependencies, p.js.compressor)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/js/libs.js')).should.be.true
				done()


