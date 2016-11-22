'use strict';

const { indent } = require('./string');
const { msDiff } = require('./stopwatch');
const chalk = require('chalk');

const TOO_LONG = 10;

const start = process.hrtime();
let last = null;

exports.BELL = '\x07';
// Silent during testing by default
exports.silent = (process.env.NODE_ENV == 'test');
exports.verbose = false;

/**
 * Print 'msg' to console, with indentation level
 * @param {String} msg
 * @param {Int} column
 */
exports.print = function (msg, column) {
  if (column == null) column = 0;
  if (!exports.silent) console.log(indent(msg, column));
};

/**
 * Print 'err' to console, with error colour and indentation level
 * @param {Object|String} err
 * @param {Int} column
 * @param {Boolean} throws
 * @returns {null}
 */
exports.error = function (err, column, throws) {
  if (exports.silent) return;
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
  if (!throws) return console.log(err);
  throw err;
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
  const now = process.hrtime();

  if (!last) last = now;

  const ellapsed = msDiff(now, last);

  if (column == null) column = 0;
  if (exports.verbose) {
    msg = chalk.cyan('+')
      + chalk.bold.grey((ellapsed > TOO_LONG ? chalk.red(ellapsed) : ellapsed) + 'ms')
      + chalk.cyan('::')
      + chalk.bold.grey(msDiff(now, start) + 'ms')
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