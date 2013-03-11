path = require('path')
fs = require('fs')
should = require('should')
rimraf = require('rimraf')
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
			target 'js', {input: 'src/some.coffee', output: 'js', source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input is a directory and output is a file', (done) ->
			target 'js', {input: 'src/package', output: 'js/main.js', source: {locations: ['src/package']}, processors: processors.js}, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input file isnt in project', (done) ->
			target 'js', {input: 'src/main.coffee', output: 'js/main.js', source: {locations: ['src/package'], add: -> false}, processors: processors.js}, (err, instance) ->
				should.exist(err)
				done()
		it 'should return an error if input directory isnt in sources', (done) ->
			target 'js', {input: 'src', output: 'js', source: {locations: ['src/package'], add: -> false}, processors: processors.js}, (err, instance) ->
				should.exist(err)
				done()

	describe 'Target instance', ->
		describe '"output" property', ->
			it 'should resolve to a single file when input is file and output is directory', (done) ->
				target 'js', {input: 'src/package/Class.coffee', output: 'js', source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
					instance.output.should.equal(path.resolve('js/Class.js'))
					done()

		describe '"concat" property', ->
			it 'should be false for directory input', (done) ->
				target 'js', {input: 'src/package', output: 'js', source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
					instance.options.concat.should.be.false
					done()
			it 'should be false for file input and a modular option of false', (done) ->
				target 'js', {input: 'src/main.coffee', output: 'js', modular: false, source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
					instance.options.concat.should.be.false
					done()
			it 'should be true for file input and a modular option of true', (done) ->
				target 'js', {input: 'src/main.coffee', output: 'js', modular: true, source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
					instance.options.concat.should.be.true
					done()
			it 'should be true for directory input and type of css', (done) ->
				target 'css', {input: 'src/main.coffee', output: 'js', modular: true, source: {locations: ['src']}, processors: processors.css}, (err, instance) ->
					instance.options.concat.should.be.true
					done()

		describe 'parsing js sources', ->
			before (done) ->
				@tgt = null
				@src = new Source('js', ['src'], {processors:processors.js})
				@src.parse (err) =>
					target 'js', {input: 'src', output: 'temp', source: @src, processors: processors.js}, (err, instance) =>
						@tgt = instance
						done()
			describe 'with 1 file with no dependencies', ->
				it 'should increase \'sources\' by 1', (done) ->
					@tgt.input = path.resolve('src/basic.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(1)
						done()
				it 'should not add files to the file\'s \'dependencies\'', ->
					@tgt.sources[0].dependencies.should.have.length(0)
			describe 'with 1 file with 1 dependency', ->
				before ->
					@tgt.sources = []
				it 'should increase \'sources\' by 1', (done) ->
					@tgt.input = path.resolve('src/package/ClassCamelCase.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(1)
						done()
				it 'should add 1 file to the file\'s \'dependencies\'', ->
					@tgt.sources[0].dependencies.should.have.length(1)
			describe 'with 1 file with 1 dependency that also has 1 dependency', ->
				before ->
					@tgt.sources = []
				it 'should increase \'sources\' by 1', (done) ->
					@tgt.input = path.resolve('src/main.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(1)
						done()
				it 'should add 1 file to the file\'s \'dependencies\'', ->
					@tgt.sources[0].dependencies.should.have.length(1)
					@tgt.sources[0].dependencies[0].dependencies.should.have.length(1)
			describe 'with 1 file with 2 circular dependencies', ->
				before ->
					@tgt.sources = []
				it 'should increase \'sources\' by 1', (done) ->
					@tgt.input = path.resolve('src/circular/circular.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(1)
						done()
				it 'should add 2 files to the file\'s \'dependencies\'', ->
					@tgt.sources[0].dependencies.should.have.length(2)
			describe 'with sources duplicated in a parent target', ->
				before ->
					@tgt.sources = []
				it 'should not contain \'sources\'', (done) ->
					target 'js', {input: 'src/main.coffee', output: 'js', source: @src, processors: processors.js}, (err, instance) =>
						parent = instance
						parent.options.hasChildren = true
						parent._parse (err) =>
							@tgt.input = path.resolve('src/main.coffee')
							@tgt.options.concat = true
							@tgt.isDir = false
							@tgt.options.parent = parent
							@tgt.options.hasParent = true
							@tgt._parse (err) =>
								@tgt.sources.should.have.length(0)
								done()
			describe 'with a directory of 6 files and no dependencies', ->
				before ->
					@tgt.sources = []
				it 'should increase \'sources\' by 6', (done) ->
					@tgt.input = path.resolve('src/batch')
					@tgt.options.concat = true
					@tgt.isDir = true
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(6)
						done()
			describe 'with a directory of 6 files with 3 dependencies', ->
				before ->
					@tgt.sources = []
				it 'should increase \'sources\' by 3', (done) ->
					@tgt.input = path.resolve('src/batch-dependencies')
					@tgt.options.concat = true
					@tgt.isDir = true
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(3)
						done()

		describe 'parsing css sources', ->
			before (done) ->
				@tgt = null
				@src = new Source('css', ['src-css'], {processors:processors.css})
				@src.parse (err) =>
					target 'css', {input: 'src-css', output: 'temp', source: @src, processors: processors.css}, (err, instance) =>
						@tgt = instance
						done()
			describe 'with a directory of 2 files and 1 shared dependency', ->
				it 'should increase \'sources\' by 2', (done) ->
					@tgt.input = path.resolve('src-css')
					@tgt.options.concat = true
					@tgt.isDir = true
					@tgt._parse (err) =>
						@tgt.sources.should.have.length(2)
						done()
				it 'should add the shared dependency to both files', ->
					@tgt.sources[0].dependencies.should.eql(@tgt.sources[1].dependencies)

		describe 'outputing sources', ->
			before (done) ->
				@tgt = null
				@src = new Source('js', ['src'], {processors:processors.js})
				@src.parse (err) =>
					target 'js', {input: 'src', output: 'temp', source: @src, processors: processors.js}, (err, instance) =>
						@tgt = instance
						done()
			after ->
				rimraf.sync(path.resolve('temp'))
			describe 'with 1 js file and no dependencies', ->
				it 'should write 1 file to disk', (done) ->
					@tgt.input = path.resolve('src/basic.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					file =
						moduleID: 'basic'
						getContent: -> fs.readFileSync(path.resolve('src/basic.coffee'), 'utf8')
						filepath: path.resolve('src/basic.coffee')
						dependencies: []
						options:
							compile: true
							compiler: processors.js.compilers.coffee
							module: processors.js.module
						qualifiedName: 'basic'
					@tgt._outputFile file, (err) =>
						fs.existsSync(path.resolve('temp/basic.js')).should.be.true
						done()
			describe 'with 1 js file and 1 dependency', ->
				it 'should write 1 concatenated file to disk', (done) ->
					@tgt.input = path.resolve('src/package/ClassCamelCase.coffee')
					@tgt.options.concat = true
					@tgt.isDir = false
					file =
						moduleID: 'package/classcamelcase'
						filepath: path.resolve('src/package/ClassCamelCase.coffee')
						getContent: -> fs.readFileSync(path.resolve('src/package/ClassCamelCase.coffee'), 'utf8')
						dependencies: [
							{
								moduleID: 'package/class'
								filepath: path.resolve('src/package/Class.coffee')
								getContent: -> fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
								dependencies: []
								options:
									compiler: processors.js.compilers.coffee
									module: processors.js.module
								qualifiedName: 'package/Class'
							}
						]
						options:
							compiler: processors.js.compilers.coffee
							module: processors.js.module
						qualifiedName: 'package/ClassCamelCase'
					@tgt._outputFile file, (err) =>
						fs.existsSync(path.resolve('temp/package/classcamelcase.js')).should.be.true
						done()
