path = require 'path'
file = require '../lib/file'

describe 'file', ->
	beforeEach ->
		process.chdir(path.resolve(__dirname, 'fixtures/file'))

	describe 'File Class', ->
		describe 'an instance', ->
			describe 'name', ->
				it 'should match it`s location relative to the base source directory', ->
					f = new file.File('js', path.resolve('src/package/Class.coffee'), path.resolve('src'))
					f.name.should.equal('package/Class')

	describe 'JSFile Class', ->
		describe 'an instance', ->
			describe 'module name', ->
				it 'should be lowercase', ->
					f = new file.JSFile('js', path.resolve('src/package/Class.coffee'), path.resolve('src'))
					f.module.should.equal('package/class')
				it 'should convert camel case to "_"', ->
					f = new file.JSFile('js', path.resolve('src/package/ClassCamelCase.coffee'), path.resolve('src'))
					f.module.should.equal('package/class_camel_case')
			describe 'with 2 dependencies', ->
				it 'should result in a dependency count of 2', ->
					f = new file.JSFile('js', path.resolve('src/main.coffee'), path.resolve('src'))
					f.dependencies.length.should.equal(2)
			describe 'with 1 commented out dependency', ->
				it 'should result in a dependency count of 0', ->
					f = new file.JSFile('js', path.resolve('src/package/Class.coffee'), path.resolve('src'))
					f.dependencies.length.should.equal(0)
			describe 'wrap()', ->
				beforeEach ->
					@f = new file.JSFile('js', path.resolve('src/main.coffee'), path.resolve('src'))
					@c =
						'''
						var Class = require('./package/class');
						var instance = new Class();
						'''
					@cw =
						'''
						require.module('main', function(module, exports, require) {
						var Class = require('./package/class');
						var instance = new Class();
						});

						'''
					@cwm =
						'''
						require.module('main', function(module, exports, require) {
						var Class = require('./package/class');
						var instance = new Class();
						});
						require('main');
						'''
				it 'should wrap file contents in a module wrapper', ->
					@f.wrap(@c).should.equal(@cw)
				it 'should not wrap file contents in a module wrapper if already wrapped', ->
					@f.wrap(@cw).should.equal(@cw)
				it 'should include a bootstrap call if file is main entry point', ->
					@f.main = true
					@f.wrap(@c).should.equal(@cwm)

