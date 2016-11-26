'use strict';

const { regexpEscape, replace } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'string'
 * @param {MagicString} string
 * @param {Boolean} browser
 * @param {Array} dependencyReferences
 */
module.exports = function replaceDynamicReferences (string, browser, dependencyReferences) {
  for (const reference of dependencyReferences) {
    const url = browser
      ? reference.file.writeUrl
      : reference.file.filepath;
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context.replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`);

    replace(string, new RegExp(regexpEscape(reference.context), 'g'), context);
  }
};