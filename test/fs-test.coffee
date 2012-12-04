path = require('path')
fs = require('fs')
should = require('should')
rimraf = require('rimraf')
{indir, readdir, mkdir, mv, rm, cp} = require('../lib/utils/fs')

describe 'fs utils', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/utils'))

	describe 'indir', ->
		it 'should return true when checking a filepath that resides in a directory', ->
			indir('/some/directory', '/some/directory/file.js').should.be.true
			indir('/some/directory', '/some/directory/nested/file.js').should.be.true
		it 'should return false when checking a filepath that does not reside in a directory', ->
			indir('/some/directory', '/another/directory/file.js').should.be.false
			indir('/some/directory', '/some/other/directory/file.js').should.be.false

	describe 'readdir', ->
		it 'should read the contents of a flat directory', (done) ->
			readdir path.resolve('readdir-simple'), null, (err, files) ->
				files.should.have.length(4)
				done()
		it 'should read the contents of a nested directory', (done) ->
			readdir path.resolve('readdir-nested'), null, (err, files) ->
				files.should.have.length(4)
				done()
		it 'should ignore files when an ignore pattern is passed', (done) ->
			readdir path.resolve('readdir-simple'), /^Class/, (err, files) ->
				files.should.have.length(2)
				done()
		it 'should skip empty nested directories', (done) ->
			readdir path.resolve('readdir-empty'), null, (err, files) ->
				files.should.have.length(1)
				done()
		it 'should skip empty directories', (done) ->
			readdir path.resolve('readdir-empty/empty'), null, (err, files) ->
				files.should.have.length(0)
				done()

	describe 'mkdir', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('mkdir'))
		afterEach ->
			rimraf.sync(path.resolve('mkdir'))
		it 'should create a directory', (done) ->
			mkdir path.resolve('mkdir', 'test'), (err) ->
				fs.existsSync(path.resolve('mkdir', 'test')).should.be.true
				done()
		it 'should create a nested directory', (done) ->
			mkdir path.resolve('mkdir', 'test', 'test', 'test'), (err) ->
				fs.existsSync(path.resolve('mkdir', 'test', 'test', 'test')).should.be.true
				done()

	describe 'mv', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('mv'))
		afterEach ->
			rimraf.sync(path.resolve('mv'))
		it 'should move a file to an existing directory', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				fs.existsSync(path.resolve('mv', 'test.txt')).should.be.false
				fs.existsSync(path.resolve('mv', 'test', 'test.txt')).should.be.true
				done()
		it 'should move a nested file to an existing directory', (done) ->
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				fs.existsSync(path.resolve('mv', 'test.txt')).should.be.false
				fs.existsSync(path.resolve('mv', 'test', 'test.txt')).should.be.true
				done()
		it 'should return the path to the moved file', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				filepath.should.eql(path.resolve('mv', 'test', 'test.txt'))
				done()
		it 'should not return an error when moving a file to a location with an existing file of the same name', (done) ->
			fs.mkdirSync(path.resolve('mv', 'test'))
			fs.writeFileSync(path.resolve('mv', 'test.txt'), 'blah', 'utf8')
			fs.writeFileSync(path.resolve('mv', 'test', 'test.txt'), 'blah', 'utf8')
			mv path.resolve('mv', 'test.txt'), path.resolve('mv', 'test'), (err, filepath) ->
				should.not.exist(err)
				fs.existsSync(path.resolve('mv', 'test.txt')).should.be.true
				done()

	describe 'rm', ->
		beforeEach ->
			fs.mkdirSync(path.resolve('rm'))
		afterEach ->
			rimraf.sync(path.resolve('rm'))
		it 'should remove a file in the project path', (done) ->
			fs.writeFileSync(path.resolve('rm', 'test.txt'), 'blah', 'utf8')
			rm path.resolve('rm', 'test.txt'), (err) ->
				fs.existsSync(path.resolve('rm', 'test.txt')).should.be.false
				done()
		it 'should return an error when attempting to remove a file outside the project path', (done) ->
			rm path.resolve('..', 'dummy'), (err) ->
				should.exist(err)
				fs.existsSync(path.resolve('..', 'dummy')).should.be.true
				done()
		it 'should return an error when attempting to remove a file that does not exist', (done) ->
			rm path.resolve('rm', 'dummy'), (err) ->
				should.exist(err)
				done()

	describe 'cp', ->
		before ->
			process.chdir(path.resolve('cp'))
			fs.mkdirSync(path.resolve('test'))
		after ->
			rimraf.sync(path.resolve('test'))
			process.chdir(path.resolve('..'))
		it 'should copy a file from one directory to another directory', (done) ->
			cp path.resolve('main.coffee'), path.resolve('test'), (err, filepath) ->
				fs.existsSync(path.resolve('test', 'main.coffee')).should.be.true
				done()
		it 'should copy a file from one directory to a new file name in another directory', (done) ->
			cp path.resolve('main.coffee'), path.resolve('test', 'test.coffee'), (err, filepath) ->
				fs.existsSync(path.resolve('test', 'test.coffee')).should.be.true
				done()
		it 'should copy a file to a new file in the same directory with a new name', (done) ->
			cp path.resolve('test', 'main.coffee'), path.resolve('test', 'test2.coffee'), (err, filepath) ->
				fs.existsSync(path.resolve('test', 'test2.coffee')).should.be.true
				done()
		it 'should not return an error when copying a file to the same directory without a new name', (done) ->
			cp path.resolve('test', 'main.coffee'), path.resolve('test'), (err, filepath) ->
				should.not.exist(err)
				done()
		it 'should copy a directory and it\'s contents from one directory to another directory', (done) ->
			cp path.resolve('package'), path.resolve('test'), (err, filepath) ->
				fs.existsSync(path.resolve('test', 'package')).should.be.true
				done()
		it 'should only copy the contents of a directory when the source contains a trailing "/"', (done) ->
			cp path.resolve('package') + path.sep, path.resolve('test'), (err, filepath) ->
				fs.existsSync(path.resolve('test', 'Class.coffee')).should.be.true
				fs.existsSync(path.resolve('test', 'ClassCamelCase.coffee')).should.be.true
				done()
		it 'should return an error when copying a directory to a file', (done) ->
			cp path.resolve('package'), path.resolve('test', 'main.coffee'), (err, filepath) ->
				should.exist(err)
				done()
