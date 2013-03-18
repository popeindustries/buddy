var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, rimraf = require('rimraf')
	, file = require('../lib/core/file')
	, targetFactory = require('../lib/core/target');

describe('target', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/target'));
	});

	describe('factory', function() {
		it('should decorate a new Target instance with passed data', function() {
			targetFactory({input: 'src/some.coffee', output: 'js'}).should.have.property('output', 'js');
		});
	});
});
	// describe('Target instance', function() {
	// 	describe('"output" property', function() {
	// 		it 'should resolve to a single file when input is file and output is directory', (done) ->
	// 			target 'js', {input: 'src/package/Class.coffee', output: 'js', source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
	// 				instance.output.should.equal(path.resolve('js/Class.js'))
	// 				done()

	// 	describe('"concat" property', function() {
	// 		it 'should be false for directory input', (done) ->
	// 			target 'js', {input: 'src/package', output: 'js', source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
	// 				instance.options.concat.should.be.false
	// 				done()
	// 		it 'should be false for file input and a modular option of false', (done) ->
	// 			target 'js', {input: 'src/main.coffee', output: 'js', modular: false, source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
	// 				instance.options.concat.should.be.false
	// 				done()
	// 		it 'should be true for file input and a modular option of true', (done) ->
	// 			target 'js', {input: 'src/main.coffee', output: 'js', modular: true, source: {locations: ['src']}, processors: processors.js}, (err, instance) ->
	// 				instance.options.concat.should.be.true
	// 				done()
	// 		it 'should be true for directory input and type of css', (done) ->
	// 			target 'css', {input: 'src/main.coffee', output: 'js', modular: true, source: {locations: ['src']}, processors: processors.css}, (err, instance) ->
	// 				instance.options.concat.should.be.true
	// 				done()

	// 	describe('parsing js sources', function() {
	// 		before (done) ->
	// 			@tgt = null
	// 			@src = new Source('js', ['src'], {processors:processors.js})
	// 			@src.parse (err) =>
	// 				target 'js', {input: 'src', output: 'temp', source: @src, processors: processors.js}, (err, instance) =>
	// 					@tgt = instance
	// 					done()
	// 		describe('with 1 file with no dependencies', function() {
	// 			it 'should increase \'sources\' by 1', (done) ->
	// 				@tgt.input = path.resolve('src/basic.coffee')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = false
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(1)
	// 					done()
	// 			it 'should not add files to the file\'s \'dependencies\'', ->
	// 				@tgt.sources[0].dependencies.should.have.length(0)
	// 		describe('with 1 file with 1 dependency', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should increase \'sources\' by 1', (done) ->
	// 				@tgt.input = path.resolve('src/package/ClassCamelCase.coffee')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = false
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(1)
	// 					done()
	// 			it 'should add 1 file to the file\'s \'dependencies\'', ->
	// 				@tgt.sources[0].dependencies.should.have.length(1)
	// 		describe('with 1 file with 1 dependency that also has 1 dependency', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should increase \'sources\' by 1', (done) ->
	// 				@tgt.input = path.resolve('src/main.coffee')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = false
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(1)
	// 					done()
	// 			it 'should add 1 file to the file\'s \'dependencies\'', ->
	// 				@tgt.sources[0].dependencies.should.have.length(1)
	// 				@tgt.sources[0].dependencies[0].dependencies.should.have.length(1)
	// 		describe('with 1 file with 2 circular dependencies', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should increase \'sources\' by 1', (done) ->
	// 				@tgt.input = path.resolve('src/circular/circular.coffee')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = false
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(1)
	// 					done()
	// 			it 'should add 2 files to the file\'s \'dependencies\'', ->
	// 				@tgt.sources[0].dependencies.should.have.length(2)
	// 		describe('with sources duplicated in a parent target', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should not contain \'sources\'', (done) ->
	// 				target 'js', {input: 'src/main.coffee', output: 'js', source: @src, processors: processors.js}, (err, instance) =>
	// 					parent = instance
	// 					parent.options.hasChildren = true
	// 					parent._parse (err) =>
	// 						@tgt.input = path.resolve('src/main.coffee')
	// 						@tgt.options.concat = true
	// 						@tgt.isDir = false
	// 						@tgt.options.parent = parent
	// 						@tgt.options.hasParent = true
	// 						@tgt._parse (err) =>
	// 							@tgt.sources.should.have.length(0)
	// 							done()
	// 		describe('with a directory of 6 files and no dependencies', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should increase \'sources\' by 6', (done) ->
	// 				@tgt.input = path.resolve('src/batch')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = true
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(6)
	// 					done()
	// 		describe('with a directory of 6 files with 3 dependencies', function() {
	// 			before ->
	// 				@tgt.sources = []
	// 			it 'should increase \'sources\' by 3', (done) ->
	// 				@tgt.input = path.resolve('src/batch-dependencies')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = true
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(3)
	// 					done()

	// 	describe('parsing css sources', function() {
	// 		before (done) ->
	// 			@tgt = null
	// 			@src = new Source('css', ['src-css'], {processors:processors.css})
	// 			@src.parse (err) =>
	// 				target 'css', {input: 'src-css', output: 'temp', source: @src, processors: processors.css}, (err, instance) =>
	// 					@tgt = instance
	// 					done()
	// 		describe('with a directory of 2 files and 1 shared dependency', function() {
	// 			it 'should increase \'sources\' by 2', (done) ->
	// 				@tgt.input = path.resolve('src-css')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = true
	// 				@tgt._parse (err) =>
	// 					@tgt.sources.should.have.length(2)
	// 					done()
	// 			it 'should add the shared dependency to both files', ->
	// 				@tgt.sources[0].dependencies.should.eql(@tgt.sources[1].dependencies)

	// 	describe('outputing sources', function() {
	// 		before (done) ->
	// 			@tgt = null
	// 			@src = new Source('js', ['src'], {processors:processors.js})
	// 			@src.parse (err) =>
	// 				target 'js', {input: 'src', output: 'temp', source: @src, processors: processors.js}, (err, instance) =>
	// 					@tgt = instance
	// 					done()
	// 		after ->
	// 			rimraf.sync(path.resolve('temp'))
	// 		describe('with 1 js file and no dependencies', function() {
	// 			it 'should write 1 file to disk', (done) ->
	// 				@tgt.input = path.resolve('src/basic.coffee')
	// 				@tgt.options.concat = false
	// 				@tgt.isDir = false
	// 				file =
	// 					moduleID: 'basic'
	// 					qualifiedName: 'basic'
	// 					getContent: -> fs.readFileSync(path.resolve('src/basic.coffee'), 'utf8')
	// 					filepath: path.resolve('src/basic.coffee')
	// 					dependencies: []
	// 					options:
	// 						compile: true
	// 						compiler: processors.js.compilers.coffee
	// 						module: processors.js.module
	// 				@tgt._outputFile file, (err) =>
	// 					fs.existsSync(path.resolve('temp/basic.js')).should.be.true
	// 					done()
	// 		describe('with 1 js file and 1 dependency', function() {
	// 			it 'should write 1 concatenated file to disk', (done) ->
	// 				@tgt.input = path.resolve('src/package/ClassCamelCase.coffee')
	// 				@tgt.options.concat = true
	// 				@tgt.isDir = false
	// 				file =
	// 					moduleID: 'package/classcamelcase'
	// 					qualifiedName: 'package/ClassCamelCase'
	// 					filepath: path.resolve('src/package/ClassCamelCase.coffee')
	// 					getContent: -> fs.readFileSync(path.resolve('src/package/ClassCamelCase.coffee'), 'utf8')
	// 					dependencies: [
	// 						{
	// 							moduleID: 'package/class'
	// 							qualifiedName: 'package/Class'
	// 							filepath: path.resolve('src/package/Class.coffee')
	// 							getContent: -> fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
	// 							dependencies: []
	// 							options:
	// 								compiler: processors.js.compilers.coffee
	// 								module: processors.js.module
	// 						}
	// 					]
	// 					options:
	// 						compiler: processors.js.compilers.coffee
	// 						module: processors.js.module
	// 				@tgt._outputFile file, (err) =>
	// 					fs.existsSync(path.resolve('temp/package/ClassCamelCase.js')).should.be.true
	// 					done()
