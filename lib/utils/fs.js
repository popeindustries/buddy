var fs = require('fs')
	, path = require('path')
	, mkdirp = require('mkdirp')
	, rimraf = require('rimraf')
	, RE_IGNORE = /^[\.~]|~$/;

// Node 0.8.0 api change
var existsSync = exports.existsSync = fs.existsSync || path.existsSync;
var exists = exports.exists = fs.exists || path.exists;

// starts with '.', or '~', ends with '~'
exports.ignoredHidden = /^[\.~]|~$/;
// starts with '.', or '~' contains '-min.', '.min.' or 'svn', ends with '~'
exports.ignored = /^[\.~]|[-\.]min[-\.]|svn|~$/;

/**
 * Check that a 'filepath' is likely a child of a given directory
 * Applies to nested directories
 * Only makes String comparison. Does not check for existance
 * @param {String} dir
 * @param {String} filepath
 * @returns {Boolean}
 */
exports.indir = function(dir, filepath) {
	dir = path.resolve(dir);
	filepath = path.resolve(filepath);
	if (filepath.indexOf(dir) != -1) {
		if (path.relative(dir, filepath).indexOf('..') != -1) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
};

/**
 * Read and store the contents of a directory, ignoring files of type specified
 * @param {String} dir
 * @param {Regex} ignore
 * @param {Function} fn(err, files)
 */
var readdir = exports.readdir = function(dir, ignore, fn) {
	var _files = []
		, _outstanding = 0
		, _readdir;
	// Merge ignores
	ignore = ignore
		? new RegExp(exports.ignoredHidden.source + '|' + ignore.source)
		: exports.ignoredHidden;
	// Inner function
	_readdir = function(dir) {
		if (existsSync(dir)) {
			_outstanding++;
			return fs.readdir(dir, function(err, files) {
				_outstanding--;
				if (err) return fn(err);
				files.forEach(function(file) {
					// Skip ignored files
					if (!ignore.test(path.basename(file))) {
						var filepath = path.resolve(dir, file);
						_outstanding++;
						return fs.stat(filepath, function(err, stats) {
							_outstanding--;
							if (err) {
								// Exit if proper error, otherwise skip
								if (err.code === 'ENOENT') return;
								else return fn(err);
							} else {
								// Recurse child directory
								if (stats.isDirectory()) {
									return _readdir(filepath);
								} else {
									// Store
									_files.push(filepath);
									// Return if no outstanding
									if (!_outstanding) return fn(null, _files);
								}
							}
						});
					}
				});
				// Return if no outstanding
				if (!_outstanding) return fn(null, _files);
			});
		// Return if no outstanding
		} else if (!_outstanding) return fn(null, _files);
	};
	return _readdir(dir);
};

/**
 * Recursively create directory path specified by 'filepath'
 * @param {String} filepath
 * @param {Function} fn(err)
 */
var mkdir = exports.mkdir = function(filepath, fn) {
	// Resolve directory name if passed a file
	var dir = path.extname(filepath)
		? path.dirname(filepath)
		: filepath;
	if (!existsSync(dir)) {
		mkdirp(dir, function(err) {
			if (err) return fn(err);
			else return fn();
		});
	} else {
		return fn();
	}
};

/**
 * Move file or directory 'source' to 'destination'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
var mv = exports.mv = function(source, destination, force, fn) {
	if (force == null) force = false;
	mkdir(destination, function(err) {
		if (err) {
			return fn(err);
		} else {
			var filepath = path.resolve(destination, path.basename(source));
			if (!force && existsSync(filepath)) {
				return fn(null, filepath);
			} else {
				rm(filepath, function(err) {
					// Ignore rm errors
					fs.rename(source, filepath, function(err) {
						if (err) return fn(err);
						else return fn(null, filepath);
					});
				});
			}
		}
	});
};

/**
 * Copy file or directory 'source' to 'destination'
 * Copies contents of 'source' if directory and ends in trailing '/'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
var cp = exports.cp = function(source, destination, force, fn) {
	var _base = ''
		, _filepath = ''
		, _first = true
		, _outstanding = 0
		, _cp;
	if (force == null) force = false;
	// Inner function
	_cp = function(source, destination) {
		_outstanding++;
		fs.stat(source, function(err, stats) {
			var isDestFile;
			_outstanding--;
			// Exit if proper error, otherwise skip
			if (err) {
				if (err.code === 'ENOENT') return;
				else return fn(err);
			} else {
				isDestFile = path.extname(destination).length;
				// File
				if (stats.isFile()) {
					// Handle file or directory as destination
					var destDir = isDestFile ? path.dirname(destination) : destination
						, destName = isDestFile ? path.basename(destination) : path.basename(source)
						, filepath = path.resolve(destDir, destName);
					// Write file if it doesn't already exist
					if (!force && existsSync(filepath)) {
						if (!_outstanding) return fn(null, _filepath);
					} else {
						rm(filepath, function(err) {
							// Ignore rm errors
							var file;
							_outstanding++;
							// Return the new path for the first source
							if (_first) {
								_filepath = filepath;
								_first = false;
							}
							// Pipe stream
							fs.createReadStream(source).pipe(file = fs.createWriteStream(filepath));
							file.on('error', function(err) { return fn(err); });
							file.on('close', function() {
								_outstanding--;
								// Return if no outstanding
								if (!_outstanding) return fn(null, _filepath);
							});
						});
					}
				// Directory
				} else {
					// Guard against invalid directory to file copy
					if (isDestFile) {
						fn(new Error('invalid destination for copy: ' + destination));
					} else {
						// Copy contents only if source ends in '/'
						var contentsOnly = _first && /\\$|\/$/.test(source)
							, dest = contentsOnly ? destination : path.resolve(destination, path.basename(source));
						// Create in destination
						_outstanding++;
						mkdir(dest, function(err) {
							_outstanding--;
							if (err) {
								return fn(err);
							} else {
								// Loop through contents
								_outstanding++;
								fs.readdir(source, function(err, files) {
									_outstanding--;
									// Exit if proper error, otherwise skip
									if (err) {
										if (err.code === 'ENOENT') return;
										else return fn(err);
									} else {
										// Return the new path for the first source
										if (_first) {
											_filepath = dest;
											_first = false;
										}
										// Loop through files and cp
										files.forEach(function(file) {
											_cp(path.resolve(source, file), dest);
										});
										// Return if no outstanding
										if (!_outstanding) return fn(null, _filepath);
									}
								});
							}
						});
					}
				}
			}
		});
		// Return if no outstanding
		if (!_outstanding) return fn(null, _filepath);
	};
	return _cp(source, destination);
};

/**
 * Recursive remove file or directory
 * Makes sure only project sources are removed
 * @param {String} source
 * @param {Function} fn(err)
 */
var rm = exports.rm = function(source, fn) {
	if (existsSync(source)) {
		if (source.indexOf(process.cwd()) != -1) {
			rimraf(source, function(err) {
				if (err) return fn(err);
				else return fn();
			});
		} else {
			fn(new Error('cannot rm source outside of project path: ' + source));
		}
	} else {
		fn(new Error('cannot rm non-existant source: ' + source));
	}
};
