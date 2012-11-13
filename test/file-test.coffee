path = require('path')
Builder = require('../lib/builder')
Configuration = require('../lib/configuration')
plugins = require('../lib/plugins')
File = require('../lib/file')

describe 'File', ->
	beforeEach ->
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
		it 'should store a reference to the compiler plugin appropriate for that file', ->
			b = new Builder
			c = b.config = new Configuration()
			b.plugins = plugins.load()
			f = new File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'), b.plugins.js.compilers)
			f.compiler.extension.should.equal(f.extension)