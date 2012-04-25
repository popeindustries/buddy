path = require 'path'
fs = require 'fs'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'

term.silent = true

describe 'Builder', ->

	describe 'configuration', ->
		beforeEach ->
			@builder = new Builder()

		describe 'loading config JSON file', ->
			before ->
				process.chdir(path.resolve(__dirname, 'fixtures/builder/config'))
			describe 'from a valid working directory', ->
				it 'should succeed', ->
					@builder._loadConfig(@builder._locateConfig()).should.be.true
			describe 'with a valid file path', ->
				it 'should succeed', ->
					@builder._loadConfig(@builder._locateConfig('buddy.json')).should.be.true
			describe 'with an invalid JSON format', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_bad.json')).should.be.false
			describe 'with an invalid file path', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_none.json')).should.be.false
			describe 'with a valid directory path', ->
				it 'should succeed', ->
					@builder._loadConfig(@builder._locateConfig()).should.be.true
			describe 'from a valid nested working directory', ->
				it 'should succeed', ->
					process.chdir(path.resolve(__dirname, 'fixtures/builder/config/nested'))
					@builder._loadConfig(@builder._locateConfig()).should.be.true
			describe 'from an invalid working directory', ->
				it 'should fail', ->
					process.chdir('/')
					@builder._loadConfig(@builder._locateConfig()).should.be.false

		describe 'validating build type', ->
			before ->
				process.chdir(path.resolve(__dirname, 'fixtures/builder/config'))
			describe 'with source, source length, target, target length', ->
				it 'should succeed', ->
					@builder._loadConfig(@builder._locateConfig('buddy.json'))
					@builder._validBuildType('js').should.be.true
			describe 'without source', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_invalid_source.json'))
					@builder._validBuildType('js').should.be.false
			describe 'without source length', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_invalid_source_length.json'))
					@builder._validBuildType('js').should.be.false
			describe 'without target', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_invalid_target.json'))
					@builder._validBuildType('js').should.be.false
			describe 'without target length', ->
				it 'should fail', ->
					@builder._loadConfig(@builder._locateConfig('buddy_invalid_target_length.json'))
					@builder._validBuildType('js').should.be.false

		describe 'parsing source directory', ->
			before ->
				process.chdir(path.resolve(__dirname, 'fixtures/builder/init/source'))
			describe 'with ignored files and folders', ->
				it 'should result in a cache count of 0', ->
					@builder._parseSourceDirectory(path.resolve('ignored'), null, @builder.jsSources)
					@builder.jsSources.count.should.equal(0)
			describe 'with invalid files', ->
				it 'should result in a cache count of 0', ->
					@builder._parseSourceDirectory(path.resolve('invalid'), null, @builder.jsSources)
					@builder.jsSources.count.should.equal(0)
			describe 'with a single built file', ->
				it 'should result in a cache count of 0', ->
					@builder._parseSourceDirectory(path.resolve('built'), null, @builder.jsSources)
					@builder.jsSources.count.should.equal(0)
			describe 'with 1 source file', ->
				it 'should result in a cache count of 1', ->
					@builder._parseSourceDirectory(path.resolve('src'), null, @builder.jsSources)
					@builder.jsSources.count.should.equal(1)
			describe 'with 1 source file and 2 nested source files', ->
				it 'should result in a cache count of 3', ->
					@builder._parseSourceDirectory(path.resolve('src-nested'), null, @builder.jsSources)
					@builder.jsSources.count.should.equal(3)

		describe 'parsing build target', ->
			beforeEach ->
				@builder.base = path.resolve(__dirname, 'fixtures/builder/init/target')
				@builder._parseSourceDirectory(@builder.base, null, @builder.jsSources)
			describe 'with an input file that doesn`t exist', ->
				it 'should result in a target count of 0', ->
					@builder._parseTargets([{'in': 'none.coffee', 'out': ''}], 'js')
					@builder.jsTargets.should.have.length(0)
			describe 'with an input file that doesn`t exist in sources', ->
				it 'should result in a target count of 0', ->
					@builder._parseTargets([{'in': '../source/src/main.coffee', 'out': ''}], 'js')
					@builder.jsTargets.should.have.length(0)
			describe 'with an input directory and an output file', ->
				it 'should result in a target count of 0', ->
					@builder._parseTargets([{'in': 'class', 'out': 'js/main.js'}], 'js')
					@builder.jsTargets.should.have.length(0)
			describe 'with a valid input file and output file', ->
				it 'should result in a target count of 1', ->
					@builder._parseTargets([{'in': 'main.coffee', 'out': 'main.js'}], 'js')
					@builder.jsTargets.should.have.length(1)
			describe 'with a valid target containing a valid child target', ->
				it 'should result in a target count of 2', ->
					@builder._parseTargets([{'in': 'main.coffee', 'out': 'main.js', 'targets':[{'in':'class', 'out':'../js'}]}], 'js')
					@builder.jsTargets.should.have.length(2)


