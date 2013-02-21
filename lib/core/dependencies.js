var path = require('path')
	, fs = require('fs')
	, async = require('async')
	, rimraf = require('rimraf')
	, Dependency = require('./Dependency')
	, processors = require('../processors')
	, notify = require('../utils/notify')
	, debug = notify.debug
	, strong = notify.strong
	, colour = notify.colour
	, _fs = require('../utils/fs')
	, mv = _fs.mv
	, cp = _fs.cp
	, mkdir = _fs.mkdir
	, existsSync = _fs.existsSync;

var childDependencies = []
	, dependencies = []
	, outputFiles = []
	, temp = null;

/**
 * Install dependencies and call 'fn' when complete
 * param {Object} options
 * param {Function} fn(err, files)
 */
exports.install = function(options, fn) {
	var data;
	temp = path.resolve('.tmp');
	dependencies = [];
	childDependencies = [];
	outputFiles = [];
	for (var destination in options) {
		data = options[destination];
		data.sources.forEach(function(source) {
			dependencies.push(new Dependency(source, destination, data.output, temp));
		});
	}
	// Create temp directory to store archive downloads
	mkdir(temp, function(err) {
		if (err) return fn(err);
		debug("created temp directory: " + (strong(path.relative(process.cwd(), temp))), 3);
		// Install
		async.forEach(dependencies, _installDependency, function(err) {
			// All errors demoted to warnings
			// Install child dependencies
			// TODO: check that deeply nested child dependencies are installed
			if (childDependencies.length) {
				async.forEach(childDependencies, _installDependency, function(err) {
					// Add child dependencies before parents
					dependencies = childDependencies.concat(dependencies);
					_pack(function(err) {
						fn(err, outputFiles);
					});
				});
			} else {
				_pack(function(err) {
					fn(err, outputFiles);
				});
			}
		});
	});
};

/**
 * Force cleaning of temp directory
 */
exports.clean = function() {
	_clear();
};

/**
 * Install a dependency
 * param {Dependency} dependency
 * param {Function} fn(err)
 */
function _installDependency(dependency, fn) {
	dependency.install(function(err, dependencies) {
		if (err) {
			// Error installing (non-critical)
			notify.warn(err);
			// Remove and destroy
			dependencies.splice(dependencies.indexOf(dependency), 1);
			dependency.destroy();
		} else {
			// Store dependencies
			if (dependencies.length) {
				dependencies.forEach(function(source) {
					childDependencies.push(new Dependency(source, dependency.destination, dependency.output, temp));
				});
			}
			notify.print("" + (colour('installed', notify.GREEN)) + " " + (strong(dependency.id)) + " to " + (strong(path.relative(process.cwd(), dependency.destination))), 3);
			// Store generated file references
			outputFiles = outputFiles.concat(dependency.files);
			fn();
		}
	});
}

/**
 * Package dependencies into single output file if necessary
 * param {Function} fn(err)
 */
function _pack(fn) {
	var outputs = {}
		, files
		, outputable = dependencies.filter(function(dependency) {
			return dependency.output;
		});
	_clear();
	// Collect outputable dependencies
	if (outputable.length) {
		outputable.forEach(function(dependency) {
			if (outputs[dependency.output] == null) outputs[dependency.output] = [];
			outputs[dependency.output] = outputs[dependency.output].concat(dependency.resources);
		});
		// Concat, compress, and write each output file
		for (var output in outputs) {
			files = outputs[output];
			async.map(files, fs.readFile, function(err, contents) {
				if (err) return fn(err);
				var content = contents.join('\n');
				async.waterfall([
					// Create directory
					(function(cb) {
						mkdir(output, cb);
					})
					// Compress
					, (function(cb) {
						processors.installed.js.compressor.compress(content, cb);
					})
					// Write file
					, (function(content, cb) {
						fs.writeFile(output, content, 'utf8', cb);
					})
					// Notify and store generated
					, (function(cb) {
						notify.print("" + (colour('compressed', notify.GREEN)) + " " + (strong(path.relative(process.cwd(), output))), 3);
						outputFiles.push(output);
						cb();
					})
				// Return with error
				], fn);
			});
		}
	} else {
		fn();
	}
}

/**
 * Clear the temp directory
 */
function _clear() {
	rimraf.sync(temp);
}
