'use strict';

const { regexpEscape } = require('../../utils/string');

const ENV_RUNTIME = 'RUNTIME';
// Match process.env.FOO, process.env['FOO'], or process.env["FOO"]
const RE_ENV = /process\.env(?:(?:\[['"])|\.)(\w+)(?:['"]\])?/gm;

/**
 * Replace process.env references with values
 * @param {String} content
 * @returns {String}
 */
module.exports = function replaceEnvironment (content) {
  let matches = {};
  let match;

  // Find all matches
  while (match = RE_ENV.exec(content)) {
    const env = process.env[match[1]];
    // Do not stringify empty values
    let value = (env != undefined)
      ? `'${env}'`
      : env;

    // Force RUNTIME to "browser"
    if (match[1] == ENV_RUNTIME) value = "'browser'";
    // Don't replace if undefined
    if (value) matches[match[0]] = value;
  }

  // Replace all references
  for (const context in matches) {
    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(context), 'gm'), matches[context]);
  }

  return content;
};