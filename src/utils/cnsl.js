// @flow

'use strict';

const { indent } = require('./string');
const { isNullOrUndefined, isString } = require('./is');
const { msDiff } = require('./stopwatch');
const chalk = require('chalk');

const TOO_LONG = 10;

const start = process.hrtime();
let last;

exports.BELL = '\x07';
// Silent during testing by default
exports.silent = process.env.NODE_ENV === 'test';
exports.verbose = false;

/**
 * Print 'msg' to console, with indentation level
 */
exports.print = function(msg: string, column: number) {
  if (isNullOrUndefined(column)) {
    column = 0;
  }
  if (!exports.silent) {
    console.log(indent(msg, column));
  }
};

/**
 * Print 'err' to console, with error colour and indentation level
 */
exports.error = function(err: { message: string } | string, column: number, throws: boolean) {
  if (exports.silent) {
    return;
  }
  if (isNullOrUndefined(column)) {
    column = 0;
  }
  if (isNullOrUndefined(throws)) {
    throws = true;
  }
  if (isString(err)) {
    err = new Error(err);
  }
  // Add beep when not throwing
  if (!throws) {
    err.message += exports.BELL;
  }
  exports.print(
    chalk.red.inverse(' error ') + ' ' + err.message + (err.filepath ? ' in ' + chalk.bold.grey(err.filepath) : ''),
    column
  );
  if (!throws) {
    console.log(err);
    return;
  }
  throw err;
};

/**
 * Print 'msg' to console, with warning colour and indentation level
 */
exports.warn = function(msg: string, column: number) {
  if (isNullOrUndefined(column)) {
    column = 0;
  }
  if (msg instanceof Error) {
    msg = msg.message;
  }
  exports.print(`${chalk.yellow.inverse(' warning ')} ${msg}`, column);
};

/**
 * Print 'msg' to console, with debug colour and indentation level
 */
exports.debug = function(msg: string, column: number) {
  const now = process.hrtime();

  if (isNullOrUndefined(last)) {
    last = now;
  }

  const ellapsed = msDiff(now, last);

  if (isNullOrUndefined(column)) {
    column = 0;
  }
  if (exports.verbose) {
    msg =
      chalk.cyan('+') +
      chalk.bold.grey((ellapsed > TOO_LONG ? chalk.red(ellapsed) : ellapsed) + 'ms') +
      chalk.cyan('::') +
      chalk.bold.grey(msDiff(now, start) + 'ms') +
      chalk.cyan('=') +
      msg;
    exports.print(msg, column);
  }
  last = now;
};

/**
 * Colourize 'string' for emphasis
 * @param {String} string
 * @returns {String}
 */
exports.strong = function(string: string) {
  return chalk.bold.grey(string);
};
