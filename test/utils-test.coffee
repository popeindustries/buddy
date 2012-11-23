path = require('path')
fs = require('fs')
rimraf = require('rimraf')
utils = require('../lib/utils')

describe.only 'utils', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/utils'))

	describe 'readdir', ->
		it 'should read the contents of a flat directory', (done) ->
			utils.readdir path.resolve('readdir-simple'), (err, files) ->
				files.should.have.length(4)
				done()
		it 'should read the contents of a nested directory', (done) ->
			utils.readdir path.resolve('readdir-nested'), (err, files) ->
				files.should.have.length(4)
				done()
		it 'should ignore files when an ignore pattern is passed', (done) ->
			utils.readdir path.resolve('readdir-simple'), (err, files) ->
				files.should.have.length(2)
				done()
			, /^Class/

	describe 'mkdir', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('mkdir'))
		afterEach ->
			rimraf.sync(path.resolve('mkdir'))
		it 'should create a directory', (done) ->
			utils.mkdir path.resolve('mkdir', 'test'), (err) ->
				fs.existsSync(path.resolve('mkdir', 'test')).should.exist
				done()
		it 'should create a nested directory', (done) ->
			utils.mkdir path.resolve('mkdir', 'test', 'test', 'test'), (err) ->
				fs.existsSync(path.resolve('mkdir', 'test', 'test', 'test')).should.exist
				done()

	describe 'mv', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('mv'))
		afterEach ->
			rimraf.sync(path.resolve('mv'))
		it 'should move a file to an existing directory', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			utils.mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				fs.existsSync(path.resolve('mv', 'test.txt')).should.not.exist
				fs.existsSync(path.resolve('mv', 'test', 'test.txt')).should.exist
				done()
		it 'should move a nested file to an existing directory', (done) ->
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			utils.mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				fs.existsSync(path.resolve('mv', 'test.txt')).should.not.exist
				fs.existsSync(path.resolve('mv', 'test', 'test.txt')).should.exist
				done()
		it 'should return the path to the moved file', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			utils.mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				filepath.should.eql(path.resolve('mv', 'test', 'test.txt'))
				done()
		it 'should return an error when moving a file to a location with an existing file of the same name', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			fs.writeFileSync(path.resolve('mv', 'test', 'test.txt'), 'blah', 'utf8')
			utils.mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				err.should.exist
				fs.existsSync(path.resolve('mv', 'test.txt')).should.exist
				done()

	describe 'rm', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('rm'))
		afterEach ->
			rimraf.sync(path.resolve('rm'))
		it 'should remove a file in the project path', (done) ->
			fs.writeFileSync(path.resolve('rm', 'test.txt'), 'blah', 'utf8')
			utils.rm path.resolve('rm', 'test.txt'), (err) ->
				fs.existsSync(path.resolve('rm', 'test.txt')).should.not.exist
				done()
		it 'should return an error when attempting to remove a file outside the project path', (done) ->
			utils.rm path.resolve('..', 'dummy'), (err) ->
				err.should.exist
				fs.existsSync(path.resolve('..', 'dummy')).should.exist
				done()
		it 'should return an error when attempting to remove a file that does not exist', (done) ->
			utils.rm path.resolve('rm', 'dummy'), (err) ->
				err.should.exist
				done()

	describe 'cp', ->
		it 'should copy a file from one directory to another'
		it 'should copy a file to the same directory, appending "copy" to the name'
		it 'should copy a directory and it`s contents from one directory to another'
		it 'should copy a directory and it`s contents to the same directory, appending "copy" to the name'
		it 'should only copy the contents of a directory when the source contains a trailing "/"'
