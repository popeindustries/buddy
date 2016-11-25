'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {MagicString} content
 * @param {Boolean} browser
 * @param {Array} dependencyReferences
 * @returns {MagicString}
 */
module.exports = function replaceDynamicReferences (content, browser, dependencyReferences) {
  const contentString = content.toString();

  for (const reference of dependencyReferences) {
    const url = browser
      ? reference.file.writeUrl
      : reference.file.filepath;
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context.replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`);
    const re = new RegExp(regexpEscape(reference.context), 'g');
    let match;

    while (match = re.exec(contentString)) {
      content.overwrite(match.index, match.index + match[0].length, context);
    }
  }

  return content;
};