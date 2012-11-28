path = require('path')
fs = require('fs')
should = require('should')
processors = require('../lib/processors')
target = require('../lib/core/target')

describe 'target', ->
	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))
		processors.load null, (err, installed) ->
			processors = installed
			done()

	describe 'factory', ->
		it 'should return an error if input isn\'t found in the project path', (done) ->
			target 'js', {input: 'initialize/src/some.coffee', output: 'initialize/js', sources: {locations: ['initialize/src']}}, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input is a directory and output is a file', (done) ->
			target 'js', {input: 'initialize/src/package', output: 'initialize/js/main.js', sources: {locations: ['initialize/src/package']}}, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input isnt in sources', (done) ->
			target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js/main.js', sources: {locations: ['initialize/src/package']}}, (err, instance) ->
				should.exist(err)
				done()

	describe 'Target instance', ->
		describe '"output" property', ->
			it 'should resolve to a single file when input is file and output is directory', (done) ->
				target 'js', {input: 'initialize/src/package/Class.coffee', output: 'initialize/js', sources: {locations: ['initialize/src']}}, (err, instance) ->
					instance.output.should.equal(path.resolve('initialize/js/Class.js'))
					done()
		describe '"batch" property', ->
			it 'should be true for directory input', (done) ->
				target 'js', {input: 'initialize/src/package', output: 'initialize/js', sources: {locations: ['initialize/src']}}, (err, instance) ->
					instance.batch.should.be.true
					done()
			it 'should be true for file input and a modular option of false', (done) ->
				target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js', modular: false, sources: {locations: ['initialize/src']}}, (err, instance) ->
					instance.batch.should.be.true
					done()
			it 'should be false for file input and a modular option of true', (done) ->
				target 'js', {input: 'initialize/src/main.coffee', output: 'initialize/js', modular: true, sources: {locations: ['initialize/src']}}, (err, instance) ->
					instance.batch.should.be.false
					done()

# describe 'JSTarget', ->
# 	beforeEach ->
# 		process.chdir(path.resolve(__dirname, 'fixtures/target'))

# 	describe '"concat" property', ->
# 		it 'should return true when modular property is true', ->
# 			t = new JSTarget(path.resolve('initialize/src/package/Class.coffee'), path.resolve('initialize/js'), {'byPath': []}, {modular: true})
# 			t.concat.should.be.true
# 		it 'should return false when modular property is true and input is a folder', ->
# 			t = new JSTarget(path.resolve('initialize/src/package/'), path.resolve('initialize/js'), {'byPath': []}, {modular: true})
# 			t.concat.should.be.false

# 	describe 'parsing input sources', ->
# 		beforeEach ->
# 			@builder = new Builder
# 			config = @builder.config = new Configuration()
# 			@builder.plugins = plugins.load()
# 			@builder._parseSourceDirectory('initialize/src', null, @builder.jsSources)
# 		describe 'with a single input source and no dependencies', ->
# 			it 'should result in a source count of 1', ->
# 				t = new JSTarget(path.resolve('initialize/src/package/Class.coffee'), path.resolve('initialize/js'), @builder.jsSources, {})
# 				t._parseSources(t.input)
# 				t.sources.should.have.length(1)
# 		describe 'with a single input source and 1 dependency', ->
# 			it 'should result in a source count of 2', ->
# 				t = new JSTarget(path.resolve('initialize/src/package/ClassCamelCase.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
# 				t._parseSources(t.input)
# 				t.sources.should.have.length(2)
# 		describe 'with a single input source duplicated in a parent target', ->
# 			it 'should result in a source count of 0', ->
# 				p = new JSTarget(path.resolve('initialize/src/main.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
# 				p._parseSources(p.input)
# 				t = new JSTarget(path.resolve('initialize/src/main.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true, parent: p})
# 				t._parseSources(t.input)
# 				t.sources.should.have.length(0)
# 		describe 'with a single input source and 2 circular dependencies', ->
# 			it 'should result in a source count of 3', ->
# 				t = new JSTarget(path.resolve('initialize/src/circular/circular.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
# 				t._parseSources(t.input)
# 				t.sources.should.have.length(3)

