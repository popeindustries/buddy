path = require('path')
fs = require('fs')
rimraf = require('rimraf')
Filelog = require('../lib/filelog')

describe.only 'filelog', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/filelog'))
		@filelog = new Filelog
	after ->
		rimraf.sync(@filelog.filename)

	describe 'adding file references', ->
		it 'should be persisted to disk', ->
			files = ['some/file.js', 'some/other/file.js']
			@filelog.add(files)
			log = JSON.parse(fs.readFileSync(@filelog.filename, 'utf8'))
			log.should.eql(files)
	describe 'cleaning file references', ->
		it 'should clear all from disk', ->
			@filelog.clean()
			log = JSON.parse(fs.readFileSync(@filelog.filename, 'utf8'))
			log.should.eql([])