var expect = require('expect.js')
	, Cache = require('./fixtures/cache')
	, compile = require('..').compile
	, path = require('path')
	, fs = require('fs')

	, options;

describe('transfigure-babel', function () {
	before(function () {
		process.chdir('./test/fixtures');
	});
	beforeEach(function () {
		options = {
			cache: Cache.create()
		}
	});

	it('should accept a .es6 file path and return JS content', function (done) {
		options.filepath = 'foo.js';
		compile(fs.readFileSync(path.resolve('foo.es6'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql('"use strict";\n\nvar nums = [1, 2, 3, 4],\n    fn = nums.map(function (n) {\n  return n + 1;\n});');
			done();
		});
	});
	it('should accept a .js file path and return JS content', function (done) {
		options.filepath = 'foo.js';
		compile(fs.readFileSync(path.resolve('foo.js'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql('"use strict";\n\nvar nums = [1, 2, 3, 4],\n    fn = nums.map(function (n) {\n  return n + 1;\n});');
			expect(options.cache.getSource('js-helpers')).to.eql(undefined);
			done();
		});
	});
	it('should accept a .jsx file path and return JS content', function (done) {
		options.filepath = 'foo.jsx';
		compile(fs.readFileSync(path.resolve('foo.jsx'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql('"use strict";\n\nvar profile = React.createElement(\n  "div",\n  null,\n  React.createElement("img", { src: "avatar.png", "class": "profile" }),\n  React.createElement(\n    "h3",\n    null,\n    [user.firstName, user.lastName].join(\' \')\n  )\n);');
			done();
		});
	});
	it('should cache helper boilerplate', function (done) {
		options.filepath = 'all.js';
		compile(fs.readFileSync(path.resolve('all.js'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			var helpers = options.cache.getSource('js-helpers');
			expect(helpers).to.contain('var global = window.global = window;');
			expect(helpers).to.contain('babelHelpers.classCallCheck =');
			expect(helpers).to.contain('babelHelpers.createClass =');
			expect(helpers).to.contain('babelHelpers.defineProperty =');
			expect(helpers).to.contain('babelHelpers.get =');
			expect(helpers).to.contain('babelHelpers.inherits =');
			expect(helpers).to.contain('babelHelpers.possibleConstructorReturn =');
			expect(helpers).to.contain('babelHelpers.taggedTemplateLiteral =');
			expect(helpers).to.contain('babelHelpers.typeof =');
			done();
		});
	});
	it('should skip a node_modules file path and return original content', function (done) {
		options.filepath = 'node_modules/foo.js';
		compile(fs.readFileSync(path.resolve('foo.js'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql(fs.readFileSync(path.resolve('foo.js'), 'utf8'));
			done();
		});
	});
	it.skip('should remove dead code', function (done) {
		options.filepath = 'dead.js';
		compile(fs.readFileSync(path.resolve('dead.js'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql('\nfoo();');
			done();
		});
	});
	it.skip('should parse vanilla es5 with dead code options', function (done) {
		options.filepath = 'deadFail.js';
		compile(fs.readFileSync(path.resolve('deadFail.js'), 'utf8'), options, function (err, content) {
			expect(err).to.be(null);
			expect(content).to.eql(fs.readFileSync(path.resolve('compiled/deadFail.js'), 'utf8'));
			done();
		});
	});
	it('should return an error when compiling a malformed file', function (done) {
		options.filepath = 'foo-bad.es6';
		compile(fs.readFileSync(path.resolve('foo-bad.es6'), 'utf8'), options, function (err, content) {
			expect(err).to.be.an(Error);
			done();
		});
	});
});