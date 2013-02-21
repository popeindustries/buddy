path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Watcher = require('../lib/utils/Watcher')
{cp, rm} = require('../lib/utils/fs')

describe 'Watcher', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/watcher'))
	beforeEach (done) ->
		@watcher = new Watcher
		cp path.resolve('src') + path.sep, path.resolve('test'), false, (err, filepath) ->
			done()
	afterEach (done) ->
		@watcher.clean()
		rm path.resolve('test'), (err) ->
			done()

	describe 'watching a directory for new files', ->
		it 'should emit a create event on addition of a new file', (done) ->
			newfile = path.resolve('test/coffee/dummy.coffee')
			setTimeout (=>
				@watcher.watch(path.resolve('test'))
				@watcher.once 'create', (file, stats) =>
					file.should.eql(newfile)
					done()
				setTimeout (-> fs.writeFileSync(newfile, 'blah', 'utf8')), 500)
			, 500
	describe 'watching a directory for change to an existing file', ->
		it 'should emit a change event on update of file contents', (done) ->
			oldfile = path.resolve('test/coffee/main.coffee')
			setTimeout (=>
				@watcher.watch(path.resolve('test'))
				@watcher.once 'change', (file, stats) =>
					file.should.eql(oldfile)
					done()
				setTimeout (-> fs.writeFileSync(oldfile, 'blah', 'utf8')), 500)
			, 1000

