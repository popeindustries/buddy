path = require('path')
fs = require('fs')
rimraf = require('rimraf')
should = require('should')
Dependencies = require('../lib/dependencies')
Dependency = require('../lib/dependency')
plugins = require('../lib/plugins')
{rm, mv, cp} = require('../lib/utils')

describe 'Dependencies', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/dependencies'))
	afterEach ->
		rimraf.sync(path.resolve('libs'))

	describe 'Dependency', ->

		describe 'an instance', ->
			it 'should set `local` property if `source` exists locally', ->
				new Dependency('local/lib', '').local.should.be.true
			it 'should set `keep` property if `source` exists locally in `destination`', ->
				new Dependency('local/lib', '.').keep.should.be.true
			it 'should parse specified `version` number', ->
				new Dependency('popeindustries/buddy@0.4.0', '').version.should.eql('0.4.0')
			it 'should default unspecified `version` number to `master`', ->
				new Dependency('popeindustries/buddy', '').version.should.eql('master')
			it 'should generate a valid github `url`', ->
				new Dependency('popeindustries/buddy', '').url.should.eql('https://github.com/popeindustries/buddy/archive/master.zip')
			it 'should not generate a `url` for a named source', ->
				should.not.exist(new Dependency('jquery', '').url)
			it 'should store specified `resources` in an array', ->
				dep = new Dependency('popeindustries/lib#lib/pi/dom|lib/pi/event.js|lib/pi/utils')
				dep.resources.should.include('lib/pi/dom')
				dep.resources.should.include('lib/pi/event.js')
				dep.resources.should.include('lib/pi/utils')

		describe 'package lookup', ->
			it 'should resolve a valid `url`', (done) ->
				dependency = new Dependency('backbone', '')
				dependency.lookupPackage()
				.once 'end:lookup', ->
					dependency.url.should.eql('https://github.com/documentcloud/backbone/archive/master.zip')
					done()
			it 'should return an error for an invalid package', (done) ->
				dependency = new Dependency('bunk', '')
				dependency.lookupPackage()
				.once 'error', (err) ->
					should.exist(err)
					done()

		describe 'version validation', ->
			beforeEach ->
				@dependency = new Dependency('documentcloud/underscore', '')
			afterEach ->
				@dependency.destroy()
				@dependency = null
			it 'should ignore `1.2.3` as a valid version', (done) ->
				@dependency.version = '1.2.3'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.2.3')
					done()
			it 'should ignore `master` as a valid version', (done) ->
				@dependency.version = 'master'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('master')
					done()
			it 'should set the latest version for `*`', (done) ->
				@dependency.version = '*'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.4.2')
					done()
			it 'should set the latest version for `latest`', (done) ->
				@dependency.version = 'latest'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.4.2')
					done()
			it 'should set the highest version that satisfies `>=1.3.2`', (done) ->
				@dependency.version = '>=1.3.2'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.4.2')
					done()
			it 'should set the highest version that satisfies `>1.3.2`', (done) ->
				@dependency.version = '>1.3.2'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.4.2')
					done()
			it 'should set the highest version that satisfies `1.3.x`', (done) ->
				@dependency.version = '1.3.x'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.3.3')
					done()
			it 'should set the highest version that satisfies `1.x`', (done) ->
				@dependency.version = '1.x'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.4.2')
					done()
			it 'should set the highest version that satisfies `~1.3.2`', (done) ->
				@dependency.version = '~1.3.2'
				@dependency.validateVersion()
				.once 'end:validate', =>
					@dependency.version.should.eql('1.3.3')
					done()

		describe 'remote archive fetching', ->
			before ->
				@temp = path.resolve('libs')
				fs.mkdirSync(@temp) unless fs.existsSync(@temp)
			it 'should download an archive file to the temp directory', (done) ->
				dependency = new Dependency('popeindustries/buddy', '')
				dependency.fetch(@temp)
				.once 'end:fetch', ->
					dependency.location.should.eql(path.resolve('libs' + path.sep + 'buddy-master'))
					fs.existsSync(dependency.location).should.be.true
					done()
			it 'should return an error for an invalid url', (done) ->
				dependency = new Dependency('popeindustries/bunk', '')
				dependency.fetch(@temp)
				.once 'error', (err) ->
					should.exist(err)
					done()

		describe 'resource resolution', ->
			it 'should resolve resources for package with component.json config file', ->
				dependency = new Dependency('jquery', '')
				dependency.location = path.resolve('archive/jquery-master')
				dependency.resolveResources()
				dependency.resources.should.include(path.resolve('archive/jquery-master/jquery.js'))
			it 'should resolve resources for package with package.json config file', ->
				dependency = new Dependency('backbone', '')
				dependency.location = path.resolve('archive/backbone-master')
				dependency.resolveResources()
				dependency.resources.should.include(path.resolve('archive/backbone-master/backbone.js'))
			it 'should resolve resources for package with component.json config file containing `scripts` array', ->
				@dependency = new Dependency('domify', '')
				@dependency.location = path.resolve('archive/domify-master')
				@dependency.resolveResources()
				@dependency.resources.should.have.length(1)
			it 'should rename index.js resources to package {id}.js', ->
				@dependency.resources.should.include(filepath = path.resolve('archive/domify-master/domify.js'))
				rm(filepath)
			it 'should emit `dependency` event for found dependencies, passing `name@version`', ->
				dependency = new Dependency('backbone', '')
				dependency.location = path.resolve('archive/backbone-master')
				dependency.resolveResources()
				.once 'dependency', (source) =>
					source.should.eql('underscore@>=1.3.3')

		describe 'moving resources', ->
			before ->
				@temp = path.resolve('libs')
				fs.mkdirSync(@temp) unless fs.existsSync(@temp)
			it 'should move files to `destination`', ->
				@dependency = new Dependency('backbone', path.resolve('libs'))
				@dependency.location = path.resolve('archive/backbone-master')
				@dependency.resources = [path.resolve('archive/backbone-master/backbone.js')]
				@dependency.move()
				fs.existsSync(path.resolve('libs/backbone.js')).should.be.true
				cp(path.resolve('libs/backbone.js'), path.resolve('archive/backbone-master'))
			it 'should store references to moved files in `files` property', ->
				@dependency.files.should.include('libs' + path.sep + 'backbone.js')
			it 'should not move or store references to files when `keep` property is set', ->
				dependency = new Dependency(path.resolve('local/lib'), path.resolve('local'))
				dependency.move()
				dependency.files.should.have.length(0)

	describe 'installing a github source', ->
		it 'should install the resource to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_github.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/require.js')).should.be.true
				done()

	describe 'installing a github source with specified resources', ->
		it 'should install the resources to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_github_resources.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/pi/event.js')).should.be.true
				fs.existsSync(path.resolve('libs/vendor/pi/dom')).should.be.true
				done()

	describe 'installing a named source', ->
		it 'should install the resource to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/jquery.js')).should.be.true
				done()

	describe 'installing a named source with a dependency', ->
		it 'should install the resources to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_name_dependant.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/backbone.js')).should.be.true
				fs.existsSync(path.resolve('libs/vendor/underscore.js')).should.be.true
				done()

	describe 'installing a local source', ->
		it 'should copy the resources to the given path', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_local.js')).dependencies)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/vendor/lib/lib.js')).should.be.true
				done()

	describe 'installing a local source residing in the destination path', ->
		it 'should not be marked for cleanup', (done) ->
			@deps = new Dependencies(require(path.resolve('buddy_local_dest.js')).dependencies)
			@deps.install (err, files) ->
				files.should.have.length(0)
				done()

	describe 'installing sources with a specified output', ->
		it 'should concatenate and minify the resources to the given output path', (done) ->
			p = plugins.load()
			@deps = new Dependencies(require(path.resolve('buddy_output.js')).dependencies, p.js.compressor)
			@deps.install (err, files) ->
				fs.existsSync(path.resolve('libs/js/libs.js')).should.be.true
				done()


