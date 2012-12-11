path = require('path')
fs = require('fs')
node = require('../lib/processors/module/node')
css = require('../lib/processors/module/css')

describe 'Module processor', ->
	before ->
		process.chdir(path.resolve(__dirname, 'fixtures/processors/module'))

	describe 'CSS', ->
		describe 'a stylus module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/one.styl'), 'utf8')
				deps = css.getModuleDependencies(c, 'one')
				deps.should.have.length(2)
		describe 'a css module source with 2 dependencies', ->
			it 'should result in a dependency count of 2', ->
				c = fs.readFileSync(path.resolve('src/one.css'), 'utf8')
				@deps = css.getModuleDependencies(c, 'one')
				@deps.should.have.length(2)
			it 'should strip \'.css\' from dependency ids', ->
				@deps[0].should.not.include('.css')
		describe 'a css module source with 1 commented out dependency', ->
			it 'should result in a dependency count of 0', ->
				c = fs.readFileSync(path.resolve('src/five.css'), 'utf8')
				deps = css.getModuleDependencies(c, 'five')
				deps.should.have.length(0)
		describe 'concat-ing a file', ->
			it 'should replace @import rules with file contents', ->
				file =
					moduleID: 'one'
					getContent: -> fs.readFileSync(path.resolve('src/one.css'), 'utf8')
					dependencies: [
						{
							moduleID: 'two'
							getContent: -> fs.readFileSync(path.resolve('src/two.css'), 'utf8')
							dependencies: []
						},
						{
							moduleID: 'three'
							getContent: -> fs.readFileSync(path.resolve('src/three.css'), 'utf8')
							dependencies: [
								{
									moduleID: 'four'
									getContent: -> fs.readFileSync(path.resolve('src/four.css'), 'utf8')
									dependencies: []
								}
							]
						}
					]
				c =
				'''
				html {
					margin: 0;
				}

				p {
					padding: 0;
				}

				body {
					padding: 0;
				}

				'''
				content = css.concat(file).replace(/\r/gm, '')
				content.should.not.include('@import')
				content.should.eql(c)

	describe 'Node', ->
		describe 'a module id from a filename containing spaces', ->
			it 'should contain no spaces', ->
				node.getModuleID('path/to/illegal file').should.equal('path/to/illegalfile')
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
				@cl =
					'''
					var Class = require("./package/Class");
					var instance = new Class();
					'''
				@cw =
					'''
					require.register('main', function(module, exports, require) {
					  var Class = require('./package/Class');
					  var instance = new Class();
					});
					'''
				@cwl =
					'''
					require.register('main', var Class = require("./package/Class");\nvar instance = new Class(););
					'''
			it 'should wrap js file contents in a module wrapper', ->
				node.wrapModuleContents(@c, 'main', false).should.equal(@cw)
			it 'should wrap js file contents in a lazy wrapper when \'lazy\'', ->
				node.wrapModuleContents(@cl, 'main', true).should.equal(@cwl)
			it 'should not wrap js file contents in a module wrapper if already wrapped', ->
				node.wrapModuleContents(@cw, 'main', false).should.equal(@cw)
			it 'should not wrap js file contents in a lazy wrapper if already wrapped', ->
				node.wrapModuleContents(@cwl, 'main', true).should.equal(@cwl)

		describe 'concat-ing a file', ->
			it 'should join file contents', ->
				file =
					moduleID: 'main'
					getContent: -> fs.readFileSync(path.resolve('src/main.coffee'), 'utf8')
					dependencies: [
						{
							moduleID: 'package/class'
							getContent: -> fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
							dependencies: []
						},
						{
							moduleID: 'package/classcamelcase'
							getContent: -> fs.readFileSync(path.resolve('src/package/ClassCamelCase.coffee'), 'utf8')
							dependencies: [
								{
									moduleID: 'package/class'
									getContent: -> fs.readFileSync(path.resolve('src/package/Class.coffee'), 'utf8')
									dependencies: []
								}
							]
						}
					]
				c =
				'''
				# Nothing = require('./nonexistant')
				module.exports = class Class
					constructor: ->
						@someVar = 'hey'
					someFunc: ->
						console.log @someVar
				Class = require './class'
				module.exports = class ClassCamelCase extends Class
					constructor: ->
						@someVar = 'hey'
					someFunc: ->
						console.log @someVar
				Class = require('./package/class')
				ClassCamelCase = require('./package/classcamelcase')
				instance = new Class
				'''
				content = node.concat(file).replace(/\r  \n/gm, '\n')
				content.should.eql(c)
