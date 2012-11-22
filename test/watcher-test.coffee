path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Watcher = require('../lib/watcher')
{cp, wait} = require('../lib/utils')

describe 'Watcher', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/watcher'))
	beforeEach ->
		@watcher = new Watcher
		cp(path.resolve('src') + '/', path.resolve('test'))
	afterEach (done) ->
		@watcher.clean()
		rimraf path.resolve('test'), (err) ->
			done()

	describe 'watching a directory for new files', ->
		it 'should emit a create event on addition of a new file', (done) ->
			newfile = path.resolve('test/coffee/dummy.coffee')
			wait 1000, =>
				@watcher.watch(path.resolve('test'))
				@watcher.once 'create', (file, stats) =>
					file.should.eql(newfile)
					done()
				wait 500, -> fs.writeFileSync(newfile, 'blah', 'utf8')
	describe 'watching a directory for change to an existing file', ->
		it 'should emit a change event on update of file contents', (done) ->
			oldfile = path.resolve('test/coffee/main.coffee')
			wait 1000, =>
				@watcher.watch(path.resolve('test'))
				@watcher.once 'change', (file, stats) =>
					file.should.eql(oldfile)
					done()
				wait 500, -> fs.writeFileSync(oldfile, 'blah', 'utf8')

