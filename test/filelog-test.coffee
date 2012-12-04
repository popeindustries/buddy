path = require('path')
fs = require('fs')
rimraf = require('rimraf')
filelog = require('../lib/utils/filelog')

describe 'filelog', ->
	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/filelog'))
		filelog.load (err) ->
			done()
	afterEach (done) ->
		filelog.clean (err) ->
			done()

	describe 'add', ->
		it 'should persist added file references to disk', (done) ->
			f = ['some' + path.sep + 'file.js', 'some' + path.sep + 'other' + path.sep + 'file.js']
			filelog.add f, (err, files) ->
				log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'))
				log.should.eql(f)
				done()
		it 'should persist relative file paths to disk', (done) ->
			f = [path.resolve('some' + path.sep + 'absolute' + path.sep + 'file.js')]
			filelog.add f, (err, files) ->
				log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'))
				log.should.eql(['some' + path.sep + 'absolute' + path.sep + 'file.js'])
				done()

	describe 'clean', ->
		it 'should clear all references from disk', (done) ->
			filelog.clean (err) ->
				log = JSON.parse(fs.readFileSync(filelog.filename, 'utf8'))
				log.should.eql([])
				done()