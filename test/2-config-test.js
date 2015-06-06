'use strict';

var config = require('../lib/config')
	, fs = require('fs')
	, path = require('path')
	, should = require('should');

describe('config', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/config'));
	});

	describe('locate', function () {
		describe('from a valid working directory', function () {
			it('should return a path to the default js file when no name is specified', function () {
				config.locate().toLowerCase().should.equal(path.resolve('buddy.js').toLowerCase());
			});
			it('should return a path to the named file when a name is specified', function () {
				config.locate('buddy_custom_name.js').toLowerCase().should.equal(path.resolve('buddy_custom_name.js').toLowerCase());
			});
			it('should return a path to the default file in the specified directory when a directory name is specified', function () {
				config.locate('nested').toLowerCase().should.equal(path.resolve('nested', 'buddy.js').toLowerCase());
			});
			it('should return a path to the default json file in the specified directory when a directory name is specified', function () {
				config.locate('json').toLowerCase().should.equal(path.resolve('json', 'buddy.json').toLowerCase());
			});
			it('should return a path to the default package.json file in the specified directory when a directory name is specified', function () {
				config.locate('pkgjson').toLowerCase().should.equal(path.resolve('pkgjson', 'package.json').toLowerCase());
			});
			it('should return a path to the named file in the specified directory when a directory and name are specified', function () {
				config.locate('nested/buddy_custom_name.js').toLowerCase().should.equal(path.resolve('nested', 'buddy_custom_name.js').toLowerCase());
			});
			it('should throw an error when an invalid name is specified', function () {
				try {
					config.locate('buddy_no_name.js')
				} catch (err) {
					should.exist(err);
				}
			});
		});

		describe('from a valid child working directory', function () {
			before(function () {
				process.chdir(path.resolve('src'));
			});
			after(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/config'));
			});
			it('should return a path to the default file in a parent of the cwd when no name is specified', function () {
				config.locate().toLowerCase().should.equal(path.resolve('../buddy.js').toLowerCase());
			});
		});

		describe('from an invalid working directory', function () {
			before(function () {
				process.chdir('/');
			});
			after(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/config'));
			});
			it('should return an error', function () {
				try {
					config.locate()
				} catch (err) {
					should.exist(err);
				}
			});
		});
	});

	describe('parse', function () {
		it('should allow passing build data "input" that doesn\'t exist', function () {
			should.exist(config.parse([{targets:[{input:'src/hey.js',output:'js'}]}]));
		});
		it('should parse target "input"', function () {
			var target = config.parse([{input:'src/hey.js',output:'js'}]);
			target[0].input.should.eql('src/hey.js');
			target[0].inputPath.should.eql(path.resolve('src/hey.js'));
		});
		it('should parse target array "input"', function () {
			var target = config.parse([{input:['src/hey.js', 'src/ho.js'],output:'js'}]);
			target[0].input.should.eql(['src/hey.js', 'src/ho.js']);
			target[0].inputPath.should.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
		});
		it('should parse target glob pattern "input"', function () {
			var target = config.parse([{input:'src/ma*.js',output:'js'}]);
			target[0].input.should.eql('src/main.js');
			target[0].inputPath.should.eql(path.resolve('src/main.js'));
		});
		it('should parse target glob pattern array "input"', function () {
			var target = config.parse([{input:'src/m*.js',output:'js'}]);
			target[0].input.should.eql(['src/main.js', 'src/module.js']);
			target[0].inputPath.should.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
		});
		it('should parse target "output"', function () {
			var target = config.parse([{input:'src/hey.js',output:'js'}]);
			target[0].output.should.eql('js');
			target[0].outputPath.should.eql(path.resolve('js'));
		});
		it('should parse target "output_compressed"', function () {
			var target = config.parse([{input:'src/hey.js',output:'js', output_compressed:'c'}], {runtimeOptions:{compress: true},sources:['.']});
			target[0].output.should.eql('js');
			target[0].outputPath.should.eql(path.resolve('c'));
		});
		it('should return multiple targets when "input" and "output" are arrays of same length', function () {
			var target = config.parse([{input:['src/main.js','src/sub.js'],output:['js/main.js','js/sub.js']}]);
			target.should.have.length(2);
		});
		it('should throw an error when passed build data with directory "input" and a file "output"', function () {
			try {
				config.parse([{input:'src',output:'js/main.js'}]);
			} catch (err) {
				should.exist(err);
			}
			try {
				config.parse([{input:['src/main.js','src'],output:['js/main.js','js/foo.js']}]);
			} catch (err) {
				should.exist(err);
			}
		});
		it('should throw an error when passed build data with single file "input" and multiple file "output"', function () {
			try {
				config.parse([{input:'src/main.js',output:['js/main.js', 'js/foo.js']}]);
			} catch (err) {
				should.exist(err);
			}
		});
		it('should return a target with "batch" set to TRUE when "input" is a directory', function () {
			config.parse([{input:'src',output:'js'}])[0].should.have.property('batch', true);
		});
		it('should return a target with "appServer" set to TRUE when "server.file" is the same as "input"', function () {
			var target = config.parse([{input:'src/main.js'}], {sources:['.'],server:{file:'src/main.js'}});
			target[0].should.have.property('appServer', true);
		});
		it('should return a target with "appServer" set to TRUE when "server.file" is in directory "input"', function () {
			var target = config.parse([{input:'src'}], {sources:['.'],server:{file:'src/main.js'}});
			target[0].should.have.property('appServer', true);
		});
		it('should return a target with "appServer" set to TRUE when "server.file" matches a globbed "input"', function () {
			var target = config.parse([{input:'src/*.js'}], {sources:['.'],server:{file:'src/main.js'}});
			target[0].should.have.property('appServer', true);
		});
		it('should return a target with passed "sources"', function () {
			var target = config.parse([{sources:['foo'],targets:[{input:'src/main.js', output:'js'}]}]);
			target[0].sources.should.eql([path.resolve('foo'), process.cwd()]);
		});
		it('should return a target with an executable "before" hook function', function () {
			var func = config.parse([{input:'src/main.js',output:'js',before:'console.log(context);'}])[0].before;
			(typeof func == 'function').should.be.true;
		});
		it('should return a target with an executable "before" hook function when passed a path', function () {
			var func = config.parse([{input:'src/main.js',output:'js',before:'./hooks/before.js'}])[0].before;
			(typeof func == 'function').should.be.true;
		});
		it('should throw an error when passed invalid "before" hook path', function () {
			try {
				var func = config.parse([{input:'src/main.js',output:'js',before:'./hook/before.js'}])[0].before;
			} catch (err) {
				should.exist(err);
			}
		});
	});

	describe('load', function () {
		it('should return validated file data', function () {
			should.exist(config.load('buddy.js').build);
		});
		it('should return validated file data for a package.json config file', function () {
			should.exist(config.load('pkgjson/package.json').build);
		});
		it('should return validated file data for a passed in JSON object', function () {
			should.exist(config.load({
				build: {
					sources: ['src'],
					targets: [{
						'input': 'src/main.js',
						'output': 'js/main.js'
					}]
				}
			}).build);
		});
		it('should return an error when passed a reference to a malformed file', function () {
			try {
				config.load('buddy_bad.js')
			} catch (err) {
				should.exist(err);
			}
		});
		it('should return an error when passed an invalid build configuration', function () {
			try {
				config.load('buddy_bad_build.js')
			} catch (err) {
				should.exist(err);
			}
		});
	});
});