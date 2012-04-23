path = require('path')
Builder = require('../lib/builder')
target = require('../lib/target')

describe 'target', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))

	describe 'Target Class', ->
		describe 'an instance', ->
			describe 'output', ->
				it 'should resolve to a file when input is file and output is directory', ->

