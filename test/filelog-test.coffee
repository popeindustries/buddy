path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Filelog = require('../lib/filelog')

describe 'filelog', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/filelog'))
	beforeEach ->
		@filelog = new Filelog
	afterEach ->
		rimraf.sync(@filelog.filename)
		@filelog = null

	describe 'adding file references', ->
		it 'should be persisted to disk', ->
			files = ['some/file.js', 'some/other/file.js']
			@filelog.add(files)
			log = JSON.parse(fs.readFileSync(@filelog.filename, 'utf8'))
			log.should.eql(files)
	describe 'adding file references with absolute paths', ->
		it 'should persist relative file paths to disk', ->
			files = [path.resolve('some/file.js')]
			@filelog.add(files)
			log = JSON.parse(fs.readFileSync(@filelog.filename, 'utf8'))
			log.should.eql(['some/file.js'])
	describe 'cleaning file references', ->
		it 'should clear all from disk', ->
			@filelog.clean()
			log = JSON.parse(fs.readFileSync(@filelog.filename, 'utf8'))
			log.should.eql([])