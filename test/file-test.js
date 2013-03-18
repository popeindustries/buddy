var path = require('path')
	, should = require('should')
	, fileFactory = require('../lib/core/file');

describe('file', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/file'));
	});
	describe.only('factory', function() {
		it('should decorate a new File instance with passed data', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}).should.have.property('type', 'js');
		});
		it('should resolve a module id for a File instance', function() {
			fileFactory(path.resolve('src/main.js'), {type:'js', sources:[path.resolve('src')]}).should.have.property('id', 'main');
		});
		it('should resolve a module id for an "index" File instance', function() {
			fileFactory(path.resolve('src/index.js'), {type:'js', sources:[path.resolve('src')]}).should.have.property('id', 'src');
		});
		it('should resolve a module id for a node_module "index" File instance ', function() {
			fileFactory(path.resolve('node_modules/foo/index.js'), {type:'js', sources:[path.resolve('node_modules')]}).should.have.property('id', 'foo');
		});
		it('should resolve a module id for a node_modules package.json "main" File instance', function() {
			fileFactory(path.resolve('node_modules/bar/bar.js'), {type:'js', sources:[path.resolve('node_modules')]}).should.have.property('id', 'bar');
		});
	});

	describe('transfigure', function() {
		it('should store compiled and original content', function(done) {
			var file = fileFactory(path.resolve('src/main.coffee'), {type:'js', sources:[path.resolve('src')]});
			file.transfigure(function(err) {
				file._content.should.eql("Class = require('./package/class')\nClassCamelCase = require('./package/classcamelcase')\n\ninstance = new Class\n");
				file._transfiguredContent.should.eql("var Class, ClassCamelCase, instance;\n\nClass = require('./package/class');\n\nClassCamelCase = require('./package/classcamelcase');\n\ninstance = new Class;\n");
				done();
			});
		});
	});
});

	// describe 'factory', ->
	// 	it 'should allow js files for a js type source', (done) ->
	// 		file 'js', 'src/main.js', 'src', {processors: processors.js}, (err, instance) ->
	// 			should.exist(instance)
	// 			done()
	// 	it 'should allow coffeescript files for a js type source', (done) ->
	// 		file 'js', 'src/main.coffee', 'src', {processors: processors.js}, (err, instance) ->
	// 			should.exist(instance)
	// 			done()
	// 	it 'should allow css files for a css type source', (done) ->
	// 		file 'css', 'src/main.css', 'src', {processors: processors.css}, (err, instance) ->
	// 			should.exist(instance)
	// 			done()
	// 	it 'should allow stylus files for a css type source', (done) ->
	// 		file 'css', 'src/main.styl', 'src', {processors: processors.css}, (err, instance) ->
	// 			should.exist(instance)
	// 			done()
	// 	it 'should allow less files for a css type source', (done) ->
	// 		file 'css', 'src/main.less', 'src', {processors: processors.css}, (err, instance) ->
	// 			should.exist(instance)
	// 			done()
	// 	it 'should not allow invalid files for a js type source', (done) ->
	// 		file 'js', 'src/main.doc', 'src', {processors: processors.js}, (err, instance) ->
	// 			should.exist(err)
	// 			done()
	// 	it 'should not allow non-existant files', (done) ->
	// 		file 'js', 'src/some.js', 'src', {processors: processors.js}, (err, instance) ->
	// 			should.exist(err)
	// 			done()

	// describe 'File instance', ->
	// 	describe '"qualifiedName" property', ->
	// 		it 'should match it`s location relative to the base source directory', (done) ->
	// 			file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), {processors: processors.js}, (err, instance) ->
	// 				instance.qualifiedName.should.equal('package' + path.sep + 'Class')
	// 				done()
	// 		it 'should prepend it`s directory when a root filename is \`index\`', (done) ->
	// 			file 'js', path.resolve('src/index.coffee'), path.resolve('src'), {processors: processors.js}, (err, instance) ->
	// 				instance.qualifiedName.should.equal('src' + path.sep + 'index')
	// 				done()
	// 	describe '"compile" property', ->
	// 		it 'should be true for compileable file types', (done) ->
	// 			file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), {processors: processors.js}, (err, instance) ->
	// 				instance.options.compile.should.be.true
	// 				done()
	// 	describe '"compiler" property', ->
	// 		it 'should store a reference to the compiler appropriate for that file', (done) ->
	// 			file 'js', path.resolve('src/package/Class.coffee'), path.resolve('src'), {processors: processors.js}, (err, instance) ->
	// 				should.exist(instance.options.compiler)
	// 				done()