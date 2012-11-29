path = require('path')
fs = require('fs')
node = require('../lib/processors/module/node')
css = require('../lib/processors/module/css')

describe 'Module processor', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/processors/module'))

	describe 'CSS', ->
		describe 'a module id from a filename containing spaces', ->
			it 'should contain no spaces', ->
				css.getModuleId('path/to/illegal file').should.equal('path/to/illegalfile')
		describe 'a stylus module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/one.styl'), 'utf8')
				deps = css.getModuleDependencies(c, 'one')
				deps.should.have.length(2)
		describe 'a css module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/one.css'), 'utf8')
				deps = css.getModuleDependencies(c, 'one')
				deps.should.have.length(2)
		describe 'a css module source with 1 commented out dependency', ->
			it 'should result in a dependency count of 0', ->
				c = fs.readFileSync(path.resolve('src/two.css'), 'utf8')
				deps = node.getModuleDependencies(c, 'two')
				deps.should.have.length(0)

	describe 'Node', ->
		describe 'a module id from a filename containing spaces', ->
			it 'should contain no spaces', ->
				node.getModuleId('path/to/illegal file').should.equal('path/to/illegalfile')
		describe 'a coffeescript module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/main.coffee'), 'utf8')
				deps = node.getModuleDependencies(c, 'main')
				deps.should.have.length(2)
		describe 'a coffeescript module source with 1 commented out dependency', ->
			it 'should result in a dependency count of 0', ->
				c = fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
				deps = node.getModuleDependencies(c, 'package/Class')
				deps.should.have.length(0)
		describe 'a js module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/main.js'), 'utf8')
				deps = node.getModuleDependencies(c, 'main')
				deps.should.have.length(2)
		describe 'a js module source with 1 commented out dependency', ->
			it 'should result in a dependency count of 0', ->
				c = fs.readFileSync(path.resolve('src/package/Class.js'), 'utf8')
				deps = node.getModuleDependencies(c, 'package/Class')
				deps.should.have.length(0)
		describe 'module wrapping', ->
			before ->
				@c =
					'''
					var Class = require('./package/Class');
					var instance = new Class();
					'''
				@cc =
					'''
					Class = require('./package/Class')
					instance = new Class()
					'''
				@cw =
					'''
					require.register('main', function(module, exports, require) {
					  var Class = require('./package/Class');
					  var instance = new Class();
					});
					'''
				@ccw =
					'''
					require.register('main', (module, exports, require) ->
					  Class = require('./package/Class')
					  instance = new Class()
					)
					'''
				@ccw2 =
					'''
					require.register 'main', (module, exports, require) ->
					  Class = require('./package/Class')
					  instance = new Class()
					'''
			it 'should wrap js file contents in a module wrapper', ->
				node.wrapModuleContents(@c, 'main').should.equal(@cw)
			it 'should wrap coffeescript file contents in a module wrapper', ->
				node.wrapModuleContents(@cc, 'main', true).should.equal(@ccw)
			it 'should not wrap js file contents in a module wrapper if already wrapped', ->
				node.wrapModuleContents(@cw, 'main').should.equal(@cw)
			it 'should not wrap coffeescript file contents in a module wrapper if already wrapped', ->
				node.wrapModuleContents(@ccw, 'main').should.equal(@ccw)
				node.wrapModuleContents(@ccw2, 'main').should.equal(@ccw2)

