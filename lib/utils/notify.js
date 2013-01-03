// Console output formatting
exports.RED = '0;31';
exports.YELLOW = '0;33';
exports.CYAN = '0;36';
exports.GREEN = '0;32';
exports.GREY = '0;90';

exports.silent = false;
exports.verbose = false;
exports.nocolor = !process.stdout.isTTY;
exports.start = exports.last = 0;

/**
 * Add TTY colours to given 'string'
 * @param {String} string
 * @param {String} colourCode
 */
exports.colour = function(string, colourCode) {
	if (exports.nocolor) return string;
	else return '\033[' + colourCode + 'm' + string + '\033[0m';
};

/**
 * Print 'msg' to console, with indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.print = function(msg, column) {
	if (column == null) column = 0;
	if (!exports.silent) console.log(exports.indent(msg, column));
};

/**
 * Print 'err' to console, with error colour and indentation level
 * @param {Object or String} err
 * @param {Int} column
 */
exports.error = function(err, column, throws) {
	if (column == null) column = 0;
	if (throws == null) throws = true;
	if ('string' == typeof err) err = new Error(err);
	// Add beep when not throwing
	if (!throws) err.message += '\x07';
	exports.print("" + (exports.colour('error', exports.RED)) + ": " + err.message, column);
	if (throws) throw err;
};

/**
 * Print 'msg' to console, with warning colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.warn = function(msg, column) {
	if (column == null) column = 0;
	if ('string' instanceof Error) msg = msg.message;
	exports.print("" + (exports.colour('warning', exports.YELLOW)) + " " + msg, column);
};

/**
 * Print 'msg' to console, with debug colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.debug = function(msg, column) {
	var now = +new Date;
	if (column == null) column = 0;
	if (!exports.last) exports.last = exports.start;
	if (exports.verbose) {
		msg = ""
			+ exports.colour('+', exports.CYAN)
			+ exports.strong(now - exports.last + 'ms')
			+ exports.colour('::', exports.CYAN)
			+ exports.strong(now - exports.start + 'ms')
			+ exports.colour('=', exports.CYAN)
			+ msg;
		exports.print(msg, column);
	}
	exports.last = now;
};

/**
 * Colourize 'string' for emphasis
 * @param {String} string
 */
exports.strong = function(string) {
	return exports.colour(string, exports.GREY);
};

/**
 * Indent the given 'string' a specific number of spaces
 * @param {String} string
 * @param {Int} column
 */
exports.indent = function(string, column) {
	var spaces = (new Array(column)).join('  ');
	return string.replace(/^/gm, spaces);
};
