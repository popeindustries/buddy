'use strict';

const ENV_RUNTIME = 'RUNTIME';
// Match process.env.FOO, process.env['FOO'], or process.env["FOO"]
const RE_ENV = /process\.env(?:(?:\[['"])|\.)(\w+)(?:['"]\])?/g;

/**
 * Replace process.env references with values
 * @param {MagicString} content
 * @param {Boolean} [browser]
 * @returns {MagicString}
 */
module.exports = function replaceEnvironment (content, browser = true) {
  const contentString = content.toString();
  let match;

  RE_ENV.lastIndex = 0;

  // Find all matches
  while (match = RE_ENV.exec(contentString)) {
    const env = process.env[match[1]];
    // Do not stringify empty values
    let value = (env != undefined)
      ? `'${env}'`
      : env;

    // Force RUNTIME to "browser/server"
    if (match[1] == ENV_RUNTIME) {
      value = browser ? "'browser'" : "'server'";
    // Ignore all others on server
    } else if (!browser) {
      value = '';
    }
    // Don't replace if undefined
    if (value) {
      content.overwrite(match.index, match.index + match[0].length, value);
    }
  }

  return content;
};