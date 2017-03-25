'use strict';

const { regexpEscape } = require('../../utils/string');

const ENV_RUNTIME = 'RUNTIME';
// Match process.env.FOO, process.env['FOO'], or process.env["FOO"]
const RE_ENV = /process\.env(?:(?:\[['"])|\.)(\w+)(?:['"]\])?/g;
const RE_PROCESS_BROWSER = /process\.browser/g;

/**
 * Replace process.env references with values
 * @param {String} content
 * @param {Boolean} [browser]
 * @returns {String}
 */
module.exports = function replaceEnvironment(content, browser = true) {
  const matches = {};
  let match;

  // Find all process.env matches
  while ((match = RE_ENV.exec(content))) {
    const env = process.env[match[1]];
    // Do not stringify empty values
    let value = env != undefined ? `'${env}'` : env;

    // Force RUNTIME to "browser/server"
    if (match[1] == ENV_RUNTIME) {
      value = browser ? "'browser'" : "'server'";
      // Ignore all others on server
    } else if (!browser) {
      value = '';
    }
    // Don't replace if undefined
    if (value) matches[match[0]] = value;
  }

  // Replace all process.env references
  for (const context in matches) {
    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(context), 'g'), matches[context]);
  }
  // Replace all process.browser matches
  content = content.replace(RE_PROCESS_BROWSER, browser);

  return content;
};
