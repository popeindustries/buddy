path = require('path')
fs = require('fs')
Builder = require('../lib/builder')
Configuration = require('../lib/core/configuration')
processors = require('../lib/processors')
Target = require('../lib/core/target')

describe 'Target', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))

	describe '"output" property', ->
		it 'should resolve to a single file when input is file and output is directory', ->
			t = new Target('js', path.resolve('initialize/src/package/Class.coffee'), path.resolve('initialize/js'), {'byPath': []})
			t.output.should.equal(path.resolve('initialize/js/Class.js'))

describe 'JSTarget', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/target'))

	describe '"concat" property', ->
		it 'should return true when modular property is true', ->
			t = new JSTarget(path.resolve('initialize/src/package/Class.coffee'), path.resolve('initialize/js'), {'byPath': []}, {modular: true})
			t.concat.should.be.true
		it 'should return false when modular property is true and input is a folder', ->
			t = new JSTarget(path.resolve('initialize/src/package/'), path.resolve('initialize/js'), {'byPath': []}, {modular: true})
			t.concat.should.be.false

	describe 'parsing input sources', ->
		beforeEach ->
			@builder = new Builder
			config = @builder.config = new Configuration()
			@builder.plugins = plugins.load()
			@builder._parseSourceDirectory('initialize/src', null, @builder.jsSources)
		describe 'with a single input source and no dependencies', ->
			it 'should result in a source count of 1', ->
				t = new JSTarget(path.resolve('initialize/src/package/Class.coffee'), path.resolve('initialize/js'), @builder.jsSources, {})
				t._parseSources(t.input)
				t.sources.should.have.length(1)
		describe 'with a single input source and 1 dependency', ->
			it 'should result in a source count of 2', ->
				t = new JSTarget(path.resolve('initialize/src/package/ClassCamelCase.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
				t._parseSources(t.input)
				t.sources.should.have.length(2)
		describe 'with a single input source duplicated in a parent target', ->
			it 'should result in a source count of 0', ->
				p = new JSTarget(path.resolve('initialize/src/main.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
				p._parseSources(p.input)
				t = new JSTarget(path.resolve('initialize/src/main.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true, parent: p})
				t._parseSources(t.input)
				t.sources.should.have.length(0)
		describe 'with a single input source and 2 circular dependencies', ->
			it 'should result in a source count of 3', ->
				t = new JSTarget(path.resolve('initialize/src/circular/circular.coffee'), path.resolve('initialize/js'), @builder.jsSources, {modular: true})
				t._parseSources(t.input)
				t.sources.should.have.length(3)

