var path = require('path')
	, fs = require('fs')
	, should = require('should')
	, configuration = require('../lib/configuration');

describe('configuration', function () {
	before(function () {
		process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
	});

	describe('locate', function () {
		describe('from a valid working directory', function () {
			it('should return a path to the default js file when no name is specified', function () {
				configuration.locate().should.equal(path.resolve('buddy.js'));
			});
			it('should return a path to the named file when a name is specified', function () {
				configuration.locate('buddy_custom_name.js').should.equal(path.resolve('buddy_custom_name.js'));
			});
			it('should return a path to the default file in the specified directory when a directory name is specified', function () {
				configuration.locate('nested').should.equal(path.resolve('nested', 'buddy.js'));
			});
			it('should return a path to the default json file in the specified directory when a directory name is specified', function () {
				configuration.locate('json').should.equal(path.resolve('json', 'buddy.json'));
			});
			it('should return a path to the default package.json file in the specified directory when a directory name is specified', function () {
				configuration.locate('pkgjson').should.equal(path.resolve('pkgjson', 'package.json'));
			});
			it('should return a path to the named file in the specified directory when a directory and name are specified', function () {
				configuration.locate('nested/buddy_custom_name.js').should.equal(path.resolve('nested', 'buddy_custom_name.js'));
			});
			it('should throw an error when an invalid name is specified', function () {
				try {
					configuration.locate('buddy_no_name.js')
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
				process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
			});
			it('should return a path to the default file in a parent of the cwd when no name is specified', function () {
				configuration.locate().should.equal(path.resolve('../buddy.js'));
			});
		});

		describe('from an invalid working directory', function () {
			before(function () {
				process.chdir('/');
			});
			after(function () {
				process.chdir(path.resolve(__dirname, 'fixtures/configuration'));
			});
			it('should return an error', function () {
				try {
					configuration.locate()
				} catch (err) {
					should.exist(err);
				}
			});
		});
	});

	describe('parse', function () {
		it('should return null when passed build data missing "targets"', function () {
			should.not.exist(configuration.parse({js:{sources:['src']}}, {compress:false}));
		});
		it('should return null when passed build data with empty "targets"', function () {
			should.not.exist(configuration.parse({js:{sources:['src'],targets:[]}}, {compress:false}));
		});
		it('should allow passing build data "input" that doesn\'t exist', function () {
			should.exist(configuration.parse({js:{sources:['src'],targets:[{input:'src/hey.js',output:'js'}]}}, {compress:false}));
		});
		it('should throw an error when passed build data with directory "input" and a file "output"', function () {
			try {
				configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js/main.js'}]}}, {compress:false})
			} catch (err) {
				should.exist(err);
			}
			try {
				configuration.parse({js:{sources:['src'],targets:[{input:['src/main.js','src'],output:['js/main.js','js/foo.js']}]}}, {compress:false})
			} catch (err) {
				should.exist(err);
			}
		});
		it('should throw an error when passed build data with array of file "input" and a single file "output"', function () {
			try {
				configuration.parse({js:{sources:['src'],targets:[{input:['src/main.js','src/sub.js'],output:'js/main.js'}]}}, {compress:false})
			} catch (err) {
				should.exist(err);
			}
		});
		it('should throw an error when passed build data with array of directory "input" and a single file "output"', function () {
			try {
				configuration.parse({js:{sources:['src'],targets:[{input:['src','src2'],output:'js/main.js'}]}}, {compress:false})
			} catch (err) {
				should.exist(err);
			}
		});
		it('should throw an error when passed build data with file "input" and multiple "output"', function () {
			try {
				configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:['js/main.js', 'js/foo.js']}]}}, {compress:false})
			} catch (err) {
				should.exist(err);
			}
		});
		it('should return an object when passed valid build data', function () {
			should.exist(configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js/main.js'}]}}, {compress:false}));
		});
		it('should return an object including valid child "targets"', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js/main.js',targets:[{input:'src/sub.js',output:'js'}]}]}}, {compress:false}).targets[0].targets.should.have.length(1);
		});
		it('should return an object with resolved "inputPath" and "outputPath" properties', function () {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false});
			data.targets[0].inputPath.should.eql(path.resolve('src/main.js'));
			data.targets[0].outputPath.should.eql(path.resolve('js/main.js'));
		});
		it('should return an object with several valid targets when "input" and "output" are arrays', function () {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:['src/main.js','src/sub.js'],output:['js/main.js','js/sub.js']}]}}, {compress:false});
			data.targets.should.have.length(2);
		});
		it('should return an object with resolved "outputPath" when "input" is file and "output" is directory', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false}).targets[0].outputPath.should.include('main.js');
		});
		it('should return an object with "isBatch" set to TRUE when "input" is a directory', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].isBatch.should.be.ok;
		});
		it('should return an object with "modular" defaulted to TRUE for js and css targets', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].modular.should.be.ok;
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js',modular:false}]}}, {compress:false}).targets[0].modular.should.not.be.ok;
		});
		it('should return an object with one valid target with an array "inputPath" when passed array "input" and directory "output"', function () {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:['src','src2'],output:'js'}]}}, {compress:false});
			data.targets[0].inputPath.should.have.length(2);
			data.targets[0].outputPath.should.eql(path.resolve('js'));
		});
		it('should return an object with one valid target with an array "inputPath" when passed glob "input" and directory "output"', function () {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:'src*/*.js',output:'js'}]}}, {compress:false});
			data.targets[0].inputPath.should.have.length(3);
			data.targets[0].outputPath.should.eql(path.resolve('js'));
		});
		it('should return an object with one valid target with an array "inputPath" when passed array "input" and array directory "output" with a single path', function () {
			var data = configuration.parse({js:{sources:['src'],targets:[{input:['src','src2'],output:['js']}]}}, {compress:false});
			data.targets[0].inputPath.should.have.length(2);
			data.targets[0].outputPath.should.eql(path.resolve('js'));
		});
		it('should return an object with the correct processing workflow set for an html target', function () {
			configuration.parse({html:{sources:['src'],targets:[{input:'src',output:'html'}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'parse', 'replaceReferences', 'compress'], ['compile', 'inline']]);
		});
		it('should return an object with the correct processing workflow set for a css target', function () {
			configuration.parse({css:{sources:['src'],targets:[{input:'src',output:'css'}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'parse'], ['inline', 'compile']]);
		});
		it('should return an object with the correct processing workflow set for a js directory target', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js'}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'replaceEnvironment', 'compile', 'parse', 'inline', 'replaceReferences', 'wrap'], ['concat']]);
			configuration.parse({js:{sources:['src'],targets:[{input:'src',output:'js',modular:false}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'replaceEnvironment', 'compile', 'parse']]);
			configuration.parse({js:{sources:['src'],targets:[{input:'src'}]}}, {compress:false}).targets[0].workflow.should.eql([['load']]);
		});
		it('should return an object with the correct processing workflow set for a js file target', function () {
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js'}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'replaceEnvironment', 'compile', 'parse', 'inline', 'replaceReferences', 'wrap'], ['concat']]);
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js',modular:false}]}}, {compress:false}).targets[0].workflow.should.eql([['load', 'replaceEnvironment', 'compile', 'parse']]);
		});
		it('should return an object with an executable "before" hook function', function () {
			var func = configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js',before:'console.log(context);'}]}}).targets[0].before;
			(typeof func == 'function').should.be.true;
		});
		it('should return an object with an executable "before" hook function when passed a path', function () {
			var func = configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',output:'js',before:'./hooks/before.js'}]}}).targets[0].before;
			(typeof func == 'function').should.be.true;
		});
		it('should return an object with passed "sources"', function () {
			configuration.parse({js:{sources:['foo'],targets:[{input:'src/main.js', output:'js'}]}}).targets[0].sources.should.eql([path.resolve('foo'), process.cwd()]);
		});
		it('should return an object with default "sources" based on "input"', function () {
			configuration.parse({js:{targets:[{input:'src/main.js', output:'js'}]}}).targets[0].sources.should.eql([path.resolve('src'), process.cwd()]);
			configuration.parse({js:{targets:[{input:['src/main.js','src2/main.js'], output:'js'}]}}).targets[0].sources.should.eql([path.resolve('src'), path.resolve('src2'), process.cwd()]);
		});
		it('should return an object with "isAppServer" set based on "input" and "server" settings', function () {
			configuration.data.server = {file:'src/main.js'};
			configuration.parse({js:{sources:['src'],targets:[{input:'src/main.js',modular:false}]}}).targets[0].isAppServer.should.be.true;
			configuration.parse({js:{sources:['src'],targets:[{input:'src',modular:false}]}}).targets[0].isAppServer.should.be.true;
			configuration.parse({js:{sources:['src'],targets:[{input:['src','src2'],modular:false}]}}).targets[0].isAppServer.should.be.true;
		});
	});

	describe('load', function () {
		it('should return validated file data', function () {
			should.exist(configuration.load('buddy.js').build);
		});
		it('should return validated file data for a package.json config file', function () {
			should.exist(configuration.load('package.json').build);
		});
		it('should return validated file data for a passed in JSON object', function () {
			should.exist(configuration.load({
				build: {
					js: {
						sources: ['src'],
						targets: [{
							'input': 'src/main.js',
							'output': 'js/main.js'
						}]
					},
					css: {
						sources: ['src'],
						targets: [{
							'input': 'src',
							'output': 'css'
						}]
					},
					html: {
						sources: [],
						targets: []
					}
				}
			}).build);
		});
		it('should return an error when passed a reference to a malformed file', function () {
			try {
				configuration.load('buddy_bad.js')
			} catch (err) {
				should.exist(err);
			}
		});
		it('should return an error when passed an invalid build configuration', function () {
			try {
				configuration.load('buddy_bad_build.js')
			} catch (err) {
				should.exist(err);
			}
		});
	});
});
