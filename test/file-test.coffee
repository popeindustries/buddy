path = require('path')
plugins = require('../lib/plugins')
File = require('../lib/file')

describe 'File', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/file'))

	describe '"qualifiedFilename" property', ->
		it 'should match it`s location relative to the base source directory', ->
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'))
			f.qualifiedFilename.should.equal('package/Class')
	describe '"needsCompile" property', ->
		it 'should be true for compileable file types', ->
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'))
			f.needsCompile.should.be.true
	describe '"compiler" property', ->
		it 'should store a reference to the compiler plugin appropriate for that file', (done)->
			plugins.load null, (err, plugins) ->
				f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'), plugins.js.compilers)
				f.compiler.extension.should.equal(f.extension)
				done()