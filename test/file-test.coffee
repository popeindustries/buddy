path = require('path')
processors = require('../lib/processors')
File = require('../lib/core/file')

describe 'File', ->
	before (done) ->
		process.chdir(path.resolve(__dirname, 'fixtures/file'))
		processors.load null, (err, installed) ->
			processors = installed
			done()

	describe '"qualifiedName" property', ->
		it 'should match it`s location relative to the base source directory', ->
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js)
			f.qualifiedName.should.equal('package/Class')
	describe '"needsCompile" property', ->
		it 'should be true for compileable file types', ->
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js)
			f.needsCompile.should.be.true
	describe '"compiler" property', ->
		it 'should store a reference to the compiler appropriate for that file', ->
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'), processors.js)
			f.compiler.extension.should.equal(f.extension)
