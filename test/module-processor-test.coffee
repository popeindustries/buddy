path = require('path')
fs = require('fs')
node = require('../lib/processors/module/node')

describe 'Module processor', ->

	describe 'Node', ->

		beforeEach ->
			process.chdir(path.resolve(__dirname, 'fixtures/processors/module'))

		describe 'a module id from a filename containing spaces', ->
			it 'should contain no spaces', ->
				node.getModuleId('path/to/illegal file').should.equal('path/to/illegalfile')
		describe 'a coffeescript module source', ->
			describe 'with 2 dependencies', ->
				it 'should result in a dependency count of 2', ->
					c = fs.readFileSync(path.resolve('src/main.coffee'), 'utf8')
					deps = node.getModuleDependencies(c, 'main')
					deps.should.have.length(2)
			describe 'with 1 commented out dependency', ->
				it 'should result in a dependency count of 0', ->
					c = fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
					deps = node.getModuleDependencies(c, 'package/Class')
					deps.should.have.length(0)
		describe 'a js module source', ->
			describe 'with 2 dependencies', ->
				it 'should result in a dependency count of 2', ->
					c = fs.readFileSync(path.resolve('src/main.js'), 'utf8')
					deps = node.getModuleDependencies(c, 'main')
					deps.should.have.length(2)
			describe 'with 1 commented out dependency', ->
				it 'should result in a dependency count of 0', ->
					c = fs.readFileSync(path.resolve('src/package/Class.js'), 'utf8')
					deps = node.getModuleDependencies(c, 'package/Class')
					deps.should.have.length(0)
		describe 'module wrapping', ->
			beforeEach ->
				@c =
					'''
					var Class = require('./package/Class');
					var instance = new Class();
					'''
				@cw =
					'''
					require.register('main', function(module, exports, require) {
					  var Class = require('./package/Class');
					  var instance = new Class();
					});
					'''
				@cwm =
					'''
					require.register('main', function(module, exports, require) {
					  var Class = require('./package/Class');
					  var instance = new Class();
					});
					'''
			it 'should wrap file contents in a module wrapper', ->
				node.wrapModuleContents(@c, 'main').should.equal(@cw)
			it 'should not wrap file contents in a module wrapper if already wrapped', ->
				node.wrapModuleContents(@cw, 'main').should.equal(@cw)

