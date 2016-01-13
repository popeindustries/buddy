'use strict';

const chalk = require('chalk')

  , TOO_LONG = 10

let last = 0
  , start = Date.now()
  , timers = {};

exports.BELL = '\x07';
// Silent during testing by default
exports.silent = (process.env.NODE_ENV == 'test');
exports.verbose = false;

/**
 * Start tracking duration of event 'id'
 * @param {String} id
 */
exports.start = function (id) {
  timers[id] = Date.now();
};

/**
 * Stop tracking duration of event 'id'
 * @param {String} id
 * @returns {Number}
 */
exports.stop = function (id) {
  const dur = Date.now() - timers[id];

  delete timers[id];

  return dur;
};

/**
 * Print 'msg' to console, with indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.print = function (msg, column) {
  if (column == null) column = 0;
  if (!exports.silent) console.log(exports.indent(msg, column));
};

/**
 * Print 'err' to console, with error colour and indentation level
 * @param {Object|String} err
 * @param {Int} column
 * @param {Boolean} throws
 */
exports.error = function (err, column, throws) {
  if (column == null) column = 0;
  if (throws == null) throws = true;
  if ('string' == typeof err) err = new Error(err);
  // Add beep when not throwing
  if (!throws) err.message += exports.BELL;
  exports.print(chalk.bold.red('error ')
    + err.message
    + (err.filepath
      ? ' in ' + chalk.bold.grey(err.filepath)
      : '')
  , column);
  if (throws && !exports.silent) throw err;
};

/**
 * Print 'msg' to console, with warning colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.warn = function (msg, column) {
  if (column == null) column = 0;
  if ('string' instanceof Error) msg = msg.message;
  exports.print(chalk.bold.yellow('warning ') + msg, column);
};

/**
 * Print 'msg' to console, with debug colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.debug = function (msg, column) {
  const now = Date.now();

  if (!last) last = now;

  const ellapsed = now - last;

  if (column == null) column = 0;
  if (exports.verbose) {
    msg = chalk.cyan('+')
      + chalk.bold.grey((ellapsed > TOO_LONG ? chalk.red(ellapsed) : ellapsed) + 'ms')
      + chalk.cyan('::')
      + chalk.bold.grey(now - start + 'ms')
      + chalk.cyan('=')
      + msg;
    exports.print(msg, column);
  }
  last = now;
};

/**
 * Colourize 'string' for emphasis
 * @param {String} string
 * @returns {String}
 */
exports.strong = function (string) {
  return chalk.bold.grey(string);
};

/**
 * Indent the given 'string' a specific number of spaces
 * @param {String} string
 * @param {Int} column
 * @returns {String}
 */
exports.indent = function (string, column) {
  const spaces = (new Array(++column)).join('  ');

  return string.replace(/^/gm, spaces);
};