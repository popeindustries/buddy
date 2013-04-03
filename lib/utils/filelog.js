var fs = require('fs')
	, path = require('path')
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong
	, NAME = '.buddy-filelog'
	, RE_ABSOLUTE = /^([a-z]:\\)|^\//i;

exports.filename = null;
exports.files = [];

/**
 * Load existing log file
 */
exports.load = function() {
	var data;
	exports.filename = path.resolve(NAME);
	if (fs.existsSync(exports.filename)) {
		data = fs.readFileSync(exports.filename, 'utf8');
		try {
			exports.files = JSON.parse(data);
			if (exports.files.length) {
				// Clean if file is old or from another system
				if ((path.sep == '/' && ~data.indexOf('\\'))
					|| (path.sep == '\\' && ~data.indexOf('/'))
					|| RE_ABSOLUTE.test(exports.files[0])) {
						exports.clean();
				}
			}
		} catch (err) {
			exports.clean();
		}
	}
};

/**
 * Add 'files' to the file log
 * @param {Array} newFiles
 * @returns {Array}
 */
exports.add = function(newFiles) {
	newFiles.forEach(function(file) {
		file = path.relative(process.cwd(), file);
		if (!~exports.files.indexOf(file)) {
			exports.files.push(file);
			debug("adding to filelog: " + (strong(file)), 2);
		}
	});
	// Save
	fs.writeFileSync(exports.filename, JSON.stringify(exports.files), 'utf8');
	return exports.files;
};

/**
 * Clean the file log of file references
 */
exports.clean = function() {
	exports.files = [];
	// Save
	fs.writeFileSync(exports.filename, JSON.stringify(exports.files), 'utf8');
	debug('cleaned filelog', 2);
};
