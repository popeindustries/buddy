'use strict';

const escape = require('../utils/reEscape');

const ENV_RUNTIME = 'RUNTIME';
// Match process.env.FOO, process.env['FOO'], or process.env["FOO"]
const RE_ENV = /process\.env(?:(?:\[['"])|\.)(\w+)(?:['"]\])?/gm;

module.exports = {
  /**
   * Replace all dependency id's in 'file' with fully resolved
   * @param {File} file
   * @param {Array} references
   * @returns {String}
   */
  references (file, references) {
    const prop = (file.type == 'html') ? 'filepath' : 'id';
    let content = file.content;
    let context;

    references.forEach((reference) => {
      // Set filepath for inline-source object
      if (file.type == 'html' && reference.stack) {
        reference.filepath = reference.instance.filepath;
      // Replace paths
      } else if (reference.instance && reference.instance.type != 'json') {
        // Don't inline 'require' call if circular, ignored, or locked
        context = (file.type == 'js' && !reference.isIgnored)
          ? `_m_['${reference.instance[prop]}']`
          : reference.match.replace(reference.filepath, reference.instance[prop]);
        // Create new RegExp so that flags work properly
        content = content.replace(new RegExp(escape(reference.match), 'gm'), context);
      }
    });

    return content;
  },

  /**
   * Inline all "process.env" references
   * @param {File} file
   * @returns {String}
   */
  environment (file) {
    let content = file.content;
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
      content = content.replace(new RegExp(escape(context), 'gm'), matches[context]);
    }

    return content;
  }
};