var fs = require('fs')
	, path = require('path')
	, existsSync = require('./fs').existsSync
	, debug = require('./notify').debug
	, strong = require('./notify').strong
	, NAME = '.buddy-filelog'
	, RE_ABSOLUTE = /^([a-z]:\\)|^\//i;

exports.filename = null;
exports.files = [];

/**
 * Load existing log file
 * @param {Function} fn(err)
 */
exports.load = function(fn) {
	exports.filename = path.resolve(NAME);
	if (existsSync(exports.filename)) {
		fs.readFile(exports.filename, 'utf8', function(err, data) {
			if (err) return fn(err);
			try {
				exports.files = JSON.parse(data);
				if (exports.files.length) {
					// Clean if file is old or from another system
					if ((path.sep == '/' && data.indexOf('\\') != -1)
						|| (path.sep == '\\' && data.indexOf('/') != -1)
						|| RE_ABSOLUTE.test(exports.files[0])) {
							exports.clean(function(err) {
								return fn();
							});
					}
				}
			} catch (err) {
				return fn(err);
			}
			return fn();
		});
	} else {
		return fn();
	}
};

/**
 * Add 'files' to the file log
 * @param {Array} newFiles
 * @param {Function} [fn(err, files)]
 */
exports.add = function(newFiles, fn) {
	newFiles.forEach(function(file) {
		file = path.relative(process.cwd(), file);
		if (exports.files.indexOf(file) == -1) {
			exports.files.push(file);
			debug("adding to filelog: " + (strong(file)), 2);
		}
	});
	// Save
	fs.writeFile(exports.filename, JSON.stringify(exports.files), 'utf8', function(err) {
		// Callback
		if (fn) {
			if (err) return fn(err);
			fn(null, exports.files);
		}
	});
};

/**
 * Clean the file log of file references
 * @param {Function} [fn(err)]
 */
exports.clean = function(fn) {
	exports.files = [];
	// Save
	fs.writeFile(exports.filename, JSON.stringify(exports.files), 'utf8', function(err) {
		debug('cleaned filelog', 2);
		// Callback
		if (fn) {
			if (err) return fn(err);
			fn();
		}
	});
};
