path = require('path')
fs = require('fs')
rimraf = require('rimraf')
processors = require('../lib/processors')
Source = require('../lib/core/source')

describe 'Source', ->

	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/source'))
		processors.load null, (err, installed) ->
			processors = installed
			done()

	describe 'adding', ->
		before ->
			@jsSource = new Source('js', [path.resolve('src'), path.resolve('invalid')], {processors:processors.js})

		it 'should add a File instance to the cache if passed a valid filename', ->
			@jsSource.add('src/main.coffee')
			@jsSource.length.should.eql(1)
		it 'should not add a File instance to the cache if passed an invalid filename', ->
			@jsSource.add('invalid/main.doc')
			@jsSource.length.should.eql(1)
		it 'should not add a File instance to the cache if passed a valid filename from outside the project root', ->
			@jsSource.add('../target/src/basic.coffee')
			@jsSource.length.should.eql(1)

	describe 'removing', ->
		it 'should remove a File instance from the cache if passed a valid filename', ->
			@jsSource.remove('src/main.coffee')
			@jsSource.length.should.eql(0)
		it 'should not remove a File instance from the cache if passed an invalid filename', ->
			@jsSource.remove('invalid/main.doc')
			@jsSource.length.should.eql(0)

	describe 'parsing a source directory', ->
		it 'should not add File instances when parsing a directory of ignored files', (done) ->
			source = new Source('js', [path.resolve('ignored')], {processors:processors.js})
			source.parse (err) ->
				source.length.should.eql(0)
				done()
		it 'should not add File instances when parsing a directory of invalid files', (done) ->
			source = new Source('js', [path.resolve('invalid')], {processors:processors.js})
			source.parse (err) ->
				source.length.should.eql(0)
				done()
		it 'should add 1 File instance when parsing a directory containing 1 valid file', (done) ->
			source = new Source('js', [path.resolve('src')], {processors:processors.js})
			source.parse (err) ->
				source.length.should.eql(1)
				done()
		it 'should add 3 File instances when parsing a directory containing 1 valid file and 2 nested valid files', (done) ->
			source = new Source('js', [path.resolve('src-nested')], {processors:processors.js})
			source.parse (err) ->
				source.length.should.eql(3)
				done()
