path = require('path')
fs = require('fs')
should = require('should')
processors = require('../lib/processors')
Source = require('../lib/core/source')
file = require('../lib/core/file')
target = require('../lib/core/target')

describe 'target', ->
	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))
		processors.load null, (err, installed) ->
			processors = installed
			done()

	describe 'factory', ->
		it 'should return an error if input isn\'t found in the project path', (done) ->
			target 'js', {input: 'initialize/src/some.coffee', output: 'initialize/js', source: {locations: ['initialize/src']}}, processors.js, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input is a directory and output is a file', (done) ->
			target 'js', {input: 'initialize/src/package', output: 'initialize/js/main.js', source: {locations: ['initialize/src/package']}}, processors.js, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input isnt in sources', (done) ->
			target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js/main.js', source: {locations: ['initialize/src/package']}}, processors.js, (err, instance) ->
				should.exist(err)
				done()

	describe 'Target instance', ->
		describe '"output" property', ->
			it 'should resolve to a single file when input is file and output is directory', (done) ->
				target 'js', {input: 'initialize/src/package/Class.coffee', output: 'initialize/js', source: {locations: ['initialize/src']}}, processors.js, (err, instance) ->
					instance.output.should.equal(path.resolve('initialize/js/Class.js'))
					done()

		describe '"concat" property', ->
			it 'should be false for directory input', (done) ->
				target 'js', {input: 'initialize/src/package', output: 'initialize/js', source: {locations: ['initialize/src']}}, processors.js, (err, instance) ->
					instance.concat.should.be.false
					done()
			it 'should be false for file input and a modular option of false', (done) ->
				target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js', modular: false, source: {locations: ['initialize/src']}}, processors.js, (err, instance) ->
					instance.concat.should.be.false
					done()
			it 'should be true for file input and a modular option of true', (done) ->
				target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js', modular: true, source: {locations: ['initialize/src']}}, processors.js, (err, instance) ->
					instance.concat.should.be.true
					done()

		describe 'adding sources', ->
			before (done) ->
				@tgt = null
				@src = new Source('js', ['initialize/src'], processors.js)
				@src.parse (err) =>
					target 'js', {input: 'initialize/src', output: 'initialize/js', source: @src}, processors.js, (err, instance) =>
						@tgt = instance
						done()
			beforeEach ->
				@tgt.sources = []
			it 'should increase \'sources\' by 1 when adding a file with no dependencies', (done) ->
				@tgt.input = path.resolve('initialize/src/basic.coffee')
				@tgt.concat = true
				@tgt.isDir = false
				f = @src.byPath[@tgt.input]
				@tgt._add f, (err) =>
					@tgt.sources.should.have.length(1)
					done()
			it 'should increase \'sources\' by 1 when adding a file with 1 dependency', (done) ->
				@tgt.input = path.resolve('initialize/src/package/ClassCamelCase.coffee')
				@tgt.concat = true
				@tgt.isDir = false
				f = @src.byPath[@tgt.input]
				@tgt._add f, (err) =>
					@tgt.sources.should.have.length(1)
					done()
			it 'should increase \'sources\' by 1 when adding a file with 1 dependency that also has 1 dependency', (done) ->
				@tgt.input = path.resolve('initialize/src/main.coffee')
				@tgt.concat = true
				@tgt.isDir = false
				f = @src.byPath[@tgt.input]
				@tgt._add f, (err) =>
					@tgt.sources.should.have.length(1)
					done()
			it 'should increase \'sources\' by 1 when adding a file with 2 circular dependencies', (done) ->
				@tgt.input = path.resolve('initialize/src/circular/circular.coffee')
				@tgt.concat = true
				@tgt.isDir = false
				f = @src.byPath[@tgt.input]
				@tgt._add f, (err) =>
					@tgt.sources.should.have.length(1)
					done()
			it 'should not increase \'sources\' when adding sources duplicated in a parent target', (done) ->
				f = @src.byPath[@tgt.input]
				target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js', source: @src}, processors.js, (err, instance) =>
					parent = instance
					parent._add f, (err) =>
						@tgt.input = path.resolve('initialize/src/main.coffee')
						@tgt.concat = true
						@tgt.isDir = false
						@tgt.options.parent = parent
						@tgt._add f, (err) =>
							@tgt.sources.should.have.length(0)
							done()

		describe.only 'parsing sources', ->
			before (done) ->
				@tgt = null
				@src = new Source('js', ['initialize/src'], processors.js)
				@src.parse (err) =>
					target 'js', {input: 'initialize/src', output: 'initialize/js', source: @src}, processors.js, (err, instance) =>
						@tgt = instance
						done()
			beforeEach ->
				@tgt.sources = []
			it 'should increase \'sources\' by 3 when adding a directory of 6 files with 3 dependencies', (done) ->
				@tgt.input = path.resolve('initialize/src/batch')
				@tgt.concat = true
				@tgt.isDir = true
				@tgt._parse (err) =>
					@tgt.sources.should.have.length(3)
					done()

