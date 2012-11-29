path = require('path')
should = require('should')
processors = require('../lib/processors')
file = require('../lib/core/file')

describe 'file', ->
	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/file'))
		processors.load null, (err, installed) ->
			processors = installed
			done()

	describe 'factory', ->
		it 'should allow js files for a js type source', (done) ->
			file 'js', 'src/main.js', 'src', processors.js, (err, instance) ->
				should.exist(instance)
				done()
		it 'should allow coffeescript files for a js type source', (done) ->
			file 'js', 'src/main.coffee', 'src', processors.js, (err, instance) ->
				should.exist(instance)
				done()
		it 'should allow typescript files for a js type source', (done) ->
			file 'js', 'src/main.ts', 'src', processors.js, (err, instance) ->
				should.exist(instance)
				done()
		it 'should allow css files for a css type source', (done) ->
			file 'css', 'src/main.css', 'src', processors.css, (err, instance) ->
				should.exist(instance)
				done()
		it 'should allow stylus files for a css type source', (done) ->
			file 'css', 'src/main.styl', 'src', processors.css, (err, instance) ->
				should.exist(instance)
				done()
		it 'should allow less files for a css type source', (done) ->
			file 'css', 'src/main.less', 'src', processors.css, (err, instance) ->
				should.exist(instance)
				done()
		it 'should not allow invalid files for a js type source', (done) ->
			file 'js', 'src/main.doc', 'src', processors.js, (err, instance) ->
				should.exist(err)
				done()
		it 'should not allow non-existant files', (done) ->
			file 'js', 'src/some.js', 'src', processors.js, (err, instance) ->
				should.exist(err)
				done()

	describe 'File instance', ->
		describe '"qualifiedName" property', ->
			it 'should match it`s location relative to the base source directory', (done) ->
				file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js, (err, instance) ->
					instance.qualifiedName.should.equal('package/Class')
					done()
		describe '"needsCompile" property', ->
			it 'should be true for compileable file types', (done) ->
				file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js, (err, instance) ->
					instance.needsCompile.should.be.true
					done()
		describe '"compiler" property', ->
			it 'should store a reference to the compiler appropriate for that file', (done) ->
				file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js, (err, instance) ->
					should.exist(instance.compiler)
					done()